// Dependency-free logic and page-render smoke checks. Run: node tests/workflows.cjs
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const elements=new Map();
const handlers={};
const element=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',className:'',focus(){},append(){},classList:{add(){},remove(){}}});return elements.get(s)};
const storage=new Map([['veritas-core-demo-user','u1']]);
const store={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const ctx={console,Date,Intl,URLSearchParams,Blob,setTimeout,clearTimeout,structuredClone,localStorage:store,sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},location:{hash:'#/dashboard'},document:{querySelector:element,addEventListener(type,fn){handlers[type]=fn},createElement:()=>({className:'',textContent:'',remove(){}})},window:{addEventListener(){},print(){}},};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8')+'\nglobalThis.seed=VCSeed;',ctx);
let app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
app=app.replace(/\}\)\(\);\s*$/,`globalThis.T={get db(){return db},get modalAction(){return modalAction},setUser(v){userId=v;localStorage.setItem(AUTH,v)},setConfirm(){confirmAction=(title,text,fn)=>fn()},render,content,route,flow,invoiceTotal,paid,balance,trial,postedLines,completeness,visibleClient};})();`);
vm.runInContext(app,ctx);
const T=ctx.T;
assert.equal(T.db.clients.length,25);
assert.equal(T.db.documents.length,50);
assert.equal(T.db.vouchers.length,8);
assert.equal(T.db.accountTemplates.length,2);
assert.equal(T.db.templates.length,5);
for(const role of ['u1','u2','u3']){
 T.setUser(role);
 for(const m of ['dashboard','clients','documents','requirements','doc-templates','missing','onboarding','compliance','monitoring','billing','knowledge','ledger','vouchers','general','years','financial','reports','notifications','profile']){
  let html=T.content(m,null);assert.ok(html.length>30,`${role} ${m} rendered`);
 }
}
T.setUser('u3');assert.equal(T.visibleClient(T.db.clients[0]),true);assert.equal(T.visibleClient(T.db.clients[1]),false);
assert.equal(T.db.clients.filter(T.visibleClient).length,13);
T.setUser('u1');let invoice=T.db.invoices.find(i=>i.status==='Issued'&&T.balance(i)>0);let original=T.balance(invoice);invoice.payments.push({id:'test',date:'2026-10-11',amount:10000,reference:'TEST'});assert.equal(T.balance(invoice),original-10000);
let before=T.postedLines().length;
let journal=T.db.journals.find(j=>j.status==='Draft'&&j.creator==='u4');
T.setConfirm();T.setUser('u4');let ownBefore=T.postedLines().length;T.flow(`submit:${journal.id}`);assert.equal(journal.status,'For Review');assert.equal(T.postedLines().length,ownBefore);
T.setUser('u2');assert.equal(T.postedLines().length,before);T.flow(`review:${journal.id}`);assert.equal(journal.status,'Reviewed');assert.equal(T.postedLines().length,before);
T.flow(`post:${journal.id}`);assert.equal(journal.status,'Posted');assert.equal(T.postedLines().length,before+2);
T.setUser('u1');let doc=T.db.documents.find(d=>d.id==='d1'),req=T.db.requirements.find(r=>r.client===doc.client&&r.template==='t1');T.flow(`approve-doc:${doc.id}`);assert.equal(doc.status,'Approved');assert.equal(req.status,'Verified');
let voucher=T.db.vouchers.find(v=>v.journal);assert.ok(T.content('vouchers',voucher.id).includes(T.db.journals.find(j=>j.id===voucher.journal).status));
let draftInvoice=T.db.invoices.find(i=>i.status==='Draft');T.flow(`issue:${draftInvoice.id}`);assert.equal(draftInvoice.status,'Issued');
let balanceBefore=T.balance(draftInvoice);T.flow(`payment:${draftInvoice.id}`);T.modalAction({get:k=>({date:'2026-10-11',amount:'100.00',reference:'TEST-PARTIAL'})[k]});assert.equal(T.balance(draftInvoice),balanceBefore-10000);
let draftArticle=T.db.articles.find(a=>a.status==='Draft');T.flow(`publish:${draftArticle.id}`);assert.equal(draftArticle.status,'Published');
let pendingCompliance=T.db.compliance.find(c=>c.status!=='Filed');T.flow(`file:${pendingCompliance.id}`);assert.equal(pendingCompliance.status,'Filed');
let balances=T.trial(),debits=balances.reduce((n,a)=>n+Math.max(0,a.net),0),credits=balances.reduce((n,a)=>n+Math.max(0,-a.net),0);assert.equal(debits,credits);
const assets=balances.filter(a=>a.type==='Asset').reduce((n,a)=>n+a.net,0),liabilities=balances.filter(a=>a.type==='Liability').reduce((n,a)=>n-a.net,0),equity=balances.filter(a=>a.type==='Equity').reduce((n,a)=>n-a.net,0),revenue=balances.filter(a=>a.type==='Revenue').reduce((n,a)=>n-a.net,0),expenses=balances.filter(a=>a.type==='Expense').reduce((n,a)=>n+a.net,0);assert.equal(assets,liabilities+equity+revenue-expenses);
assert.equal(JSON.parse(storage.get('veritas-core-demo-v1')).journals.find(j=>j.id===journal.id).status,'Posted');
handlers.click({target:{closest:()=>({dataset:{action:'reset'}})}});assert.equal(T.db.clients.length,25);assert.equal(T.db.journals.find(j=>j.id===journal.id).status,'Draft');
console.log('PASS: seed relationships, major page rendering for three roles, client isolation, document approval/checklist, journal review/posting and linked voucher, invoice issue/partial payment, article publication, compliance filing, trial balance, balance sheet, localStorage save and reset.');
