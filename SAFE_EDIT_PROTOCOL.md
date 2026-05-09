# Macaron Safe Edit Protocol

## Core rule
Test copy first. Real file second. Commit after success.

## 1. Inspect first
Before changing anything, confirm:
- exact file
- exact block
- expected result

## 2. Make a test copy
Examples:
- index.html -> test.html
- jobs.html -> jobs-test.html

Never start on the live file first.

## 3. Change one thing only
Only one unit per step:
- header/nav
- one script block
- one function
- one route
- one table section

## 4. Verify immediately
Use:
- grep
- sed -n
- browser test

Never assume a change worked.

## 5. Promote only after success
If test file works:
- copy test file back to the real file
- verify again
- then commit

## 6. Commit small
Use small commits only.
Examples:
- Connect homepage to shared public navbar
- Update jobs page to shared public navbar

## 7. Stop on weird output
If output becomes strange, repeated, half-changed, or noisy:
- stop immediately
- check git status --short
- restore only the affected file if needed

## 8. Avoid risky live patching on important HTML
Do not do long multiline shell surgery on:
- homepage
- dashboard
- jobs page
- auth pages

Prefer:
- Acode/manual edit
- or test-copy workflow

## 9. Separate work types
Do not mix in one step:
- backend logic
- frontend nav
- package install
- database migration

## 10. Always end clean
Before pausing, make sure the repo is either:
- committed clean
- or reverted clean

## Quick working pattern
1. inspect
2. copy to test file
3. edit test file
4. verify
5. copy back to real file
6. commit
7. push
