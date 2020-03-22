### Electron browser

1. Installation 
```bash
npm install
cd src/app
npm install
cd ..
cd ..
```

2. Configuration
```bash
cp src/app/config/common.json.example src/app/config/common.json
```
then change to local path

3. Local debug
```bash
npm run start
```

4. Build setup file by client
```bash
npm run build [--client=test | test2 | ...)]
```