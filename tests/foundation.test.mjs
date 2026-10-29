import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {validateEnvironment} from "../src/server/config.mjs";
test("missing or invalid environment is rejected",()=>{for(const APP_ENV of [undefined,"staging",""])assert.throws(()=>validateEnvironment({APP_ENV}))});
test("production cannot use incomplete setup",()=>assert.throws(()=>validateEnvironment({APP_ENV:"production"}),/DATABASE_URL/));
test("local environment is explicit",()=>assert.equal(validateEnvironment({APP_ENV:"local"}).appEnv,"local"));
test("design templates contain no legacy paths or scripts",()=>{for(const name of fs.readdirSync("src/content")){const html=fs.readFileSync(`src/content/${name}`,"utf8");assert.doesNotMatch(html,/<script|href="[^" ]*\.html|src="(?:\.\.\/)?assets\//)}});
test("portfolio filters have category data",()=>{const html=fs.readFileSync("src/content/works.html","utf8");assert.equal((html.match(/data-category=/g)||[]).length,5)});
