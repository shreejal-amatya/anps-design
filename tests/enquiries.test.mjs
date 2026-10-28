import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEnquiry} from '../src/features/enquiries/validation.mjs';
import {saveEnquiry,requestHash,rateKey} from '../src/server/enquiries/save.mjs';
const valid={submissionKey:'55d05b56-45bc-435f-a53d-c59382088156',name:'Test Visitor',contact:'visitor@example.test',service:'Wedding coverage',date:'2027-01-20',location:'Test venue',message:'Synthetic enquiry for an integration test.',budget:'',consent:true,website:''};
test('enquiry validates contact, service, real dates and explicit consent',()=>{
 assert.ok(validateEnquiry(valid).data);assert.ok(validateEnquiry({...valid,contact:'+977 9800000000'}).data);
 for(const patch of [{consent:false},{contact:'not a contact'},{date:'2027-02-30'},{message:'short'},{service:'invented'},{submissionKey:'x'},{website:'spam.example'}])assert.ok(validateEnquiry({...valid,...patch}).error);
});
test('submission fingerprint excludes random key but detects changed payload',()=>{const data=validateEnquiry(valid).data;assert.equal(requestHash(data),requestHash({...data,submissionKey:'another'}));assert.notEqual(requestHash(data),requestHash({...data,message:'Changed request'}));assert.notEqual(rateKey('secret','ip','same'),rateKey('secret','contact','same'));});
function fake({duplicate=false,failOutbox=false,limited=false}={}){
 const calls=[];const client={async query(sql,args){calls.push(sql);if(sql.startsWith('SELECT request_hash'))return {rowCount:duplicate?1:0,rows:duplicate?[{request_hash:requestHash(validateEnquiry(valid).data)}]:[]};if(sql.startsWith('INSERT INTO enquiry_rate_limits'))return {rows:[{requests:limited?100:1}]};if(sql.startsWith('INSERT INTO enquiries'))return {rows:[{id:'test-id'}]};if(sql.startsWith('INSERT INTO notification_outbox')&&failOutbox)throw Error('Synthetic delivery queue failure');return {rows:[]};},release(){calls.push('RELEASE');}};
 return {calls,pool:{connect:async()=>client}};
}
test('saved success commits enquiry and notification queue together',async()=>{const f=fake();assert.equal((await saveEnquiry(f.pool,validateEnquiry(valid).data,{ip:'test',secret:'secret'})).status,'saved');assert.ok(f.calls.findIndex(s=>s.startsWith('INSERT INTO notification_outbox'))<f.calls.indexOf('COMMIT'));assert.equal(f.calls.at(-1),'RELEASE');});
test('queue failure rolls back and cannot return saved success',async()=>{const f=fake({failOutbox:true});await assert.rejects(()=>saveEnquiry(f.pool,validateEnquiry(valid).data,{ip:'test',secret:'secret'}));assert.ok(f.calls.includes('ROLLBACK'));assert.ok(!f.calls.includes('COMMIT'));});
test('retry does not create another enquiry or queue entry',async()=>{const f=fake({duplicate:true});assert.equal((await saveEnquiry(f.pool,validateEnquiry(valid).data,{ip:'test',secret:'secret'})).status,'duplicate');assert.ok(!f.calls.some(s=>s.startsWith('INSERT INTO enquiries')));});
test('rate limit rejects before enquiry persistence',async()=>{const f=fake({limited:true});assert.equal((await saveEnquiry(f.pool,validateEnquiry(valid).data,{ip:'test',secret:'secret'})).status,'limited');assert.ok(!f.calls.some(s=>s.startsWith('INSERT INTO enquiries')));assert.ok(f.calls.includes('ROLLBACK'));});
