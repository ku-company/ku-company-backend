#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

function main() {
  let auditRaw;
  try {
    auditRaw = run('npm audit --json');
  } catch (e) {
    // npm audit exits non-zero on vulnerabilities; capture output regardless
    auditRaw = e.stdout || '';
  }
  if (!auditRaw) {
    console.log('No audit output');
    process.exit(0);
  }
  let report;
  try { report = JSON.parse(auditRaw); } catch { console.error('Failed to parse audit JSON'); process.exit(1); }

  const advisories = report.vulnerabilities || report.advisories || {};
  let highOrCritical = 0;
  const items = [];
  // npm v9+ uses report.vulnerabilities object with severity counts per package
  for (const [pkg, info] of Object.entries(advisories)) {
    const sev = info.severity || info.severity?.toString() || 'unknown';
    if (sev === 'high' || sev === 'critical') {
      highOrCritical++;
      items.push({ pkg, severity: sev, via: info.via });
    }
  }

  console.log(`High/Critical vulnerabilities: ${highOrCritical}`);
  if (items.length) {
    for (const i of items) {
      console.log(`- ${i.pkg} (${i.severity}) via: ${JSON.stringify(i.via)}`);
    }
  }

  if (highOrCritical > 0) {
    console.error('Failing build due to high/critical vulnerabilities');
    process.exit(1);
  }
  console.log('Dependency audit passed with no high/critical issues');
}

main();
