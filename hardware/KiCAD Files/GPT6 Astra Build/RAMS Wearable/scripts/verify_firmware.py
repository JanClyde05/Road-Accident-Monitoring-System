"""Compile both battery profiles using the installed Arduino toolchain; never flash."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

PROJECT = Path(__file__).resolve().parents[1]
REPO = PROJECT.parents[3]
SKETCH = REPO / 'firmware/wearable_withApp'
REPORT = PROJECT / 'reports/firmware_j2'
CLI = Path('C:/Program Files/Arduino IDE/resources/app/lib/backend/resources/arduino-cli.exe')
FQBN = 'esp32:esp32:esp32s3:USBMode=hwcdc,CDCOnBoot=cdc,FlashSize=4M,PSRAM=disabled,PartitionScheme=default'


def main():
    REPORT.mkdir(parents=True, exist_ok=True)
    config = REPORT / 'arduino-cli.yaml'
    config.write_text(json.dumps({'directories': {
        'data': str(Path(os.environ['LOCALAPPDATA']) / 'Arduino15'),
        'user': 'D:/newbackup/documents/Arduino'}}, indent=2), encoding='utf-8')
    sources = sorted(p for p in SKETCH.iterdir() if p.suffix in ('.h', '.cpp', '.ino'))
    sources.append(REPO / 'firmware/shared/protocol.h')
    hashes = {str(p.relative_to(REPO)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sources}
    results = {'source_hashes': hashes, 'fqbn': FQBN, 'builds': []}
    for name, flags in [('jlc_s3_j2', '-DRAMS_JLC_S3_J2'), ('supermini', '')]:
        build = Path(tempfile.gettempdir()) / ('rams_verified_' + name)
        cmd = [str(CLI), 'compile', '--config-file', str(config), '--fqbn', FQBN,
               '--build-path', str(build), '--warnings', 'default', '--jobs', '4',
               '--build-property', 'compiler.cpp.extra_flags=' + flags, str(SKETCH)]
        log = REPORT / (name + '_verified_build.log')
        print('BUILD ' + name, flush=True)
        with log.open('w', encoding='utf-8') as output:
            result = subprocess.run(cmd, stdout=output, stderr=subprocess.STDOUT)
        record = {'profile': name, 'argv': cmd, 'exit_code': result.returncode,
                  'log': str(log), 'artifacts': {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in build.glob('*.bin')} if result.returncode == 0 else {}}
        results['builds'].append(record)
        (REPORT / 'build_summary.json').write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
        print(f'{name}: exit {result.returncode}', flush=True)
        print('\n'.join(log.read_text(encoding='utf-8').splitlines()[-20:]), flush=True)
    results['sources_unchanged'] = all(hashlib.sha256((REPO / p).read_bytes()).hexdigest() == h
                                      for p, h in hashes.items())
    (REPORT / 'build_summary.json').write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
    assert results['sources_unchanged'], 'Firmware sources changed during build'
    assert all(b['exit_code'] == 0 for b in results['builds']), 'See build logs'


if __name__ == '__main__':
    main()
