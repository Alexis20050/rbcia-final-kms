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
app=app.replace(/\}\)\(\);\s*$/,`globalThis.T={get db(){return db},get modalAction(){return modalAction},setUser(v){userId=v;localStorage.setItem(AUTH,v)},setConfirm(){confirmAction=(title,text,fn)=>fn()},render,content,route,flow,invoiceTotal,invoiceStatus,paid,balance,trial,postedLines,completeness,onboardStatus,visibleClient,allowed,canCreate,canEdit,ownRecord,journalEligible,periodFor,validateVoucher,requirementState,statusFor,filteredRecords,notification};})();`);
vm.runInContext(app,ctx);
const T=ctx.T;
assert.equal(T.db.clients.length,25);
assert.equal(T.db.documents.length,50);
assert.equal(T.db.vouchers.length,8);
for(const voucher of T.db.vouchers){const linked=T.db.journals.find(j=>j.id===voucher.journal);assert.ok(linked);assert.equal(voucher.client,linked.client);assert.equal(voucher.date,linked.date);assert.doesNotThrow(()=>T.validateVoucher(voucher,linked));}
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
assert.equal(T.allowed('accounts'),true);assert.equal(T.canCreate('accounts'),false);assert.equal(T.canCreate('requirements'),false);assert.equal(T.canCreate('vouchers'),true);assert.equal(T.db.notifications.filter(n=>T.ownRecord('notifications',n)).length,1);
T.setUser('u1');let invoice=T.db.invoices.find(i=>i.status==='Open'&&T.balance(i)>0);let original=T.balance(invoice);invoice.payments.push({id:'test',date:'2026-10-11',amount:10000,reference:'TEST'});assert.equal(T.balance(invoice),original-10000);
let before=T.postedLines().length;
let journal=T.db.journals.find(j=>j.status==='Draft'&&j.creator==='u4');
T.setConfirm();T.setUser('u4');let ownBefore=T.postedLines().length;T.flow(`submit:${journal.id}`);assert.equal(journal.status,'For Review');assert.equal(T.postedLines().length,ownBefore);
T.setUser('u2');assert.equal(T.postedLines().length,before);T.flow(`review:${journal.id}`);assert.equal(journal.status,'Reviewed');assert.equal(T.postedLines().length,before);
T.flow(`post:${journal.id}`);assert.equal(journal.status,'Posted');assert.equal(T.postedLines().length,before+2);
T.setUser('u1');let doc=T.db.documents.find(d=>d.id==='d1'),req=T.db.requirements.find(r=>r.client===doc.client&&r.template==='t1');req.linkedDocuments.push(doc.id);T.flow(`approve-doc:${doc.id}`);assert.equal(doc.status,'Approved');assert.equal(req.status,'Verified');
let voucher=T.db.vouchers.find(v=>v.journal);assert.ok(T.content('vouchers',voucher.id).includes(T.db.journals.find(j=>j.id===voucher.journal).status));
let draftInvoice=T.db.invoices.find(i=>i.status==='Draft');T.flow(`issue:${draftInvoice.id}`);assert.equal(draftInvoice.status,'Open');
let balanceBefore=T.balance(draftInvoice);T.flow(`payment:${draftInvoice.id}`);T.modalAction({get:k=>({date:new Date().toISOString().slice(0,10),amount:'100.00',method:'Bank Transfer',reference:'TEST-PARTIAL'})[k]});assert.equal(T.balance(draftInvoice),balanceBefore-10000);
let draftArticle=T.db.articles.find(a=>a.status==='Draft');T.flow(`publish:${draftArticle.id}`);assert.equal(draftArticle.status,'Published');
const followFields={status:'In Progress',assignedTo:'u3',followUpDate:new Date().toISOString().slice(0,10),remarks:'Request updated evidence'};
let followRequirement=T.db.requirements.find(r=>r.client==='c1');T.flow(`followup:requirements:${followRequirement.id}`);T.modalAction({get:k=>followFields[k]});let follow=followRequirement.followups.at(-1);assert.equal(follow.status,'In Progress');assert.equal(follow.assignedTo,'u3');assert.ok(T.content('requirements',followRequirement.id).includes('Request updated evidence'));
T.flow(`edit-followup:requirements:${followRequirement.id}:${follow.id}`);T.modalAction({get:k=>({...followFields,status:'Resolved'})[k]});assert.equal(follow.status,'Resolved');assert.ok(follow.completedAt);
T.flow(`delete-followup:requirements:${followRequirement.id}:${follow.id}`);assert.equal(followRequirement.followups.some(f=>f.id===follow.id),false);
let followCompliance=T.db.compliance.find(c=>c.client==='c1');T.flow(`followup:compliance:${followCompliance.id}`);assert.throws(()=>T.modalAction({get:k=>({...followFields,assignedTo:'u4'})[k]}),/eligible active assignee/);T.modalAction({get:k=>followFields[k]});assert.equal(followCompliance.followups.at(-1).assignedTo,'u3');
let pendingCompliance=T.db.compliance.find(c=>c.status!=='Filed');T.flow(`file:${pendingCompliance.id}`);assert.equal(pendingCompliance.status,'Filed');
let balances=T.trial(),debits=balances.reduce((n,a)=>n+Math.max(0,a.net),0),credits=balances.reduce((n,a)=>n+Math.max(0,-a.net),0);assert.equal(debits,credits);
const assets=balances.filter(a=>a.type==='Asset').reduce((n,a)=>n+a.net,0),liabilities=balances.filter(a=>a.type==='Liability').reduce((n,a)=>n-a.net,0),equity=balances.filter(a=>a.type==='Equity').reduce((n,a)=>n-a.net,0),revenue=balances.filter(a=>a.type==='Revenue').reduce((n,a)=>n-a.net,0),expenses=balances.filter(a=>a.type==='Expense').reduce((n,a)=>n+a.net,0);assert.equal(assets,liabilities+equity+revenue-expenses);
assert.equal(JSON.parse(storage.get('veritas-core-demo-v1')).journals.find(j=>j.id===journal.id).status,'Posted');
const period=T.db.periods.find(p=>p.id===journal.period);assert.ok(period&&T.periodFor(journal.client,journal.date,journal.period));period.status='Closed';assert.throws(()=>T.journalEligible(journal),/open same-client accounting period/);period.status='Open';
const wrongAccount={...journal,lines:[{...journal.lines[0],account:T.db.accounts.find(a=>a.client!==journal.client).id},journal.lines[1]]};assert.throws(()=>T.journalEligible(wrongAccount),/active account for this client/);
let newClient={...T.db.clients[0],id:'test-onboard',name:'Fictional New Client',status:'Inactive',onboardedAt:null,staff:'u3'};T.db.clients.push(newClient);let newRequirement={id:'test-onboard-r',client:newClient.id,template:'t1',status:'Missing',scope:'onboarding',required:true,active:true,linkedDocuments:[],followups:[]};T.db.requirements.push(newRequirement);T.flow(`activate:${newClient.id}`);assert.equal(newClient.onboardedAt,null);newRequirement.status='Verified';T.flow(`activate:${newClient.id}`);assert.ok(newClient.onboardedAt);assert.equal(newClient.status,'Inactive');assert.equal(T.onboardStatus(newClient),'Onboarded');
T.setUser('u3');assert.equal(T.content('clients','c2').includes('Record unavailable'),true);assert.equal(T.canEdit('documents',T.db.documents.find(d=>d.id==='d1')),false);assert.equal(T.canEdit('knowledge',T.db.articles.find(a=>a.author==='u2')),false);let docBefore=T.db.documents.find(d=>d.id==='d2').status;T.flow('approve-doc:d2');assert.equal(T.db.documents.find(d=>d.id==='d2').status,docBefore);let complianceBefore=T.db.compliance.find(c=>c.id==='co1').status;T.flow('file:co1');assert.equal(T.db.compliance.find(c=>c.id==='co1').status,complianceBefore);let otherInvoice=T.db.invoices.find(i=>i.client==='c2');let otherPayments=otherInvoice.payments.length;T.flow(`payment:${otherInvoice.id}`);assert.equal(otherInvoice.payments.length,otherPayments);let foreignFollowups=T.db.requirements.find(r=>r.client==='c2').followups.length;T.flow('followup:requirements:r4');assert.equal(T.db.requirements.find(r=>r.client==='c2').followups.length,foreignFollowups);let ownerNotice=T.db.notifications.find(n=>n.user==='u1');T.flow(`read:${ownerNotice.id}`);assert.equal(ownerNotice.read,false);assert.equal(T.allowed('accounts'),true);assert.equal(T.canCreate('accounts'),false);
T.setUser('u2');assert.equal(T.canCreate('ledger'),false);assert.equal(T.canCreate('vouchers'),false);assert.equal(T.canCreate('accounts'),true);assert.equal(T.allowed('workspace'),false);assert.equal(T.canCreate('doc-templates'),true);
T.setUser('u1');let freshInvoice=T.db.invoices.find(i=>i.status==='Draft');T.flow(`issue:${freshInvoice.id}`);assert.equal(freshInvoice.status,'Open');let paymentDate=new Date().toISOString().slice(0,10),remaining=T.balance(freshInvoice);T.flow(`payment:${freshInvoice.id}`);assert.throws(()=>T.modalAction({get:k=>({date:paymentDate,amount:((remaining+100)/100).toFixed(2),method:'Cash',reference:'OVERPAY'})[k]}),/must not exceed/);assert.equal(T.balance(freshInvoice),remaining);T.flow(`payment:${freshInvoice.id}`);T.modalAction({get:k=>({date:paymentDate,amount:(remaining/100).toFixed(2),method:'Cash',reference:'FULL'})[k]});assert.equal(T.balance(freshInvoice),0);assert.equal(T.invoiceStatus(freshInvoice),'Paid');T.flow(`cancel:${freshInvoice.id}`);assert.equal(freshInvoice.status,'Open');
for(const type of ['JV','CV','CR','CD']){let cid='c1',cash=`a1000-${cid}`,other=`a4000-${cid}`,amount=10000,receipt=type==='CR',j={client:cid,date:paymentDate,lines:[{account:cash,debit:receipt?amount:0,credit:receipt?0:amount},{account:other,debit:receipt?0:amount,credit:receipt?amount:0}]},v={client:cid,date:paymentDate,type,payee:type==='JV'?'':'Demo Party',cashAccount:type==='JV'?null:cash,amount:type==='JV'?null:amount,checkNumber:type==='CV'?'CHK-1':'',checkDate:type==='CV'?paymentDate:null};assert.doesNotThrow(()=>T.validateVoucher(v,j));if(type==='CV')assert.throws(()=>T.validateVoucher({...v,checkNumber:''},j),/Check number/)}
handlers.click({target:{closest:()=>({dataset:{action:'reset'}})}});assert.equal(T.db.clients.length,25);assert.equal(T.db.journals.find(j=>j.id===journal.id).status,'Draft');
console.log('PASS: role rendering and scope; document link and approval; onboarding blockers and completion; journal period, account, review and posting; all four voucher metadata types; partial/full/overpayment billing; forbidden role actions; reporting balances; localStorage and reset.');
