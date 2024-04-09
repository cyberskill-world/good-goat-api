# Hướng dẫn

## Yêu cầu

- nvm (node version manager):
  - MacOS: <https://github.com/nvm-sh/nvm>
  - Windows: <https://github.com/coreybutler/nvm-windows>
- MongoDB: over 7.0 <https://www.mongodb.com/docs/manual/administration/install-community/>
- Node: 20.11.1 (nvm sẽ tự động cài đặt phiên bản này nếu chưa có)
  - MacOS: <https://nodejs.org/dist/v20.11.1/node-v20.11.1.pkg>
  - Windows: <https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi>
- Dùng npm, không dùng các công cụ khác để tránh xung đột

## Cài đặt

```bash
npm i --color=always
```

## Chạy ở môi trường development

```bash
npm run dev
```

Khi thành công sẽ thấy terminal/console hiển thị thông báo:

```bash
MongoDb is now running on mongodb://0.0.0.0:27017/good-goat
Running RestAPI on http://localhost:9000/rest
Running GRAPHQL on http://localhost:9000/graphql
```

## Kiểm tra lỗi (chạy thủ công)

```bash
npm run lint:check
```

## Sửa lỗi (chạy thủ công)

```bash
npm run lint:fix
```

## Một số quy ước

### Quy ước đặt tên

- Tên biến: `camelCase`
- Tên hàm: `camelCase`
- Tên biến parameter: `camelCase`
- Tên biến argument: `camelCase`

- Tên biến private: `_camelCase`
- Tên biến protected: `camelCase_`
- Tên biến static: `camelCase_`
- Tên class: `PascalCase`
- Tên hằng số: `UPPER_CASE`
- Tên file: `kebab-case`
- Tên thư mục: `kebab-case`

### Quy ước đặt tên type typescript

- Dùng tiền tố `I_` cho interface (ví dụ: `I_User`)
- Dùng tiền tố `T_` cho type (ví dụ: `T_User`)
- Dùng tiền tố `E_` cho enum (ví dụ: `E_User`)

### Quy ước đặt tên biến môi trường

- Dùng tiền tố `REACT_APP_` cho biến môi trường của react
- Dùng tiền tố `NEXT_PUBLIC_` cho biến môi trường của nextjs
- Dùng tiền tố `VITE_` cho biến môi trường của vite
- Dùng tiền tố `NODE_` cho biến môi trường của node

### Quy ước viết code

- Không dùng `var`
- Không dùng `==`
- Xóa `console.log` trước khi commit
- Xóa `debugger` trước khi commit
- Không dùng `any`, `unknown`, `never` nếu không cần thiết
- Không dùng `@ts-ignore`
- Không dùng `@ts-nocheck`

### Quy ước commit

- Commit message có dạng: `type(scope): message` (ví dụ: `feat(user): add user feature`)

### Quy ước pull request

- Pull request có dạng: `type(scope): message` (ví dụ: `feat(user): add user feature`)

## deploy server

### set up self hosted runner action on VPS

- access github settings>actions>runners>New self-hosted runner
- follow documents
when run config it will require sudo, run cmd as below instead (add RUNNER_ALLOW_RUNASROOT=1 before config)

```
RUNNER_ALLOW_RUNASROOT=1 ./config.cmd --url https://github.com/xxxxxx --token xxxxxxxxxx
```

to start runner as service, instead of run.sh, run below cmds:
for help

```
sudo ./svc.sh help
```

install and start

```
sudo ./svc.sh install
sudo ./svc.sh start
```

to check runner status

```
sudo ./svc.sh status
```

### VPS update ubuntu os

```
apt update && apt upgrade -y
```

### install node

- install nodejs

```
apt install nodejs
```

- install npm

```
apt install npm
```

### install pm2

```
npm install pm2 -g
```

- To automatically generate and configuration a startup script

```
pm2 startup
```

- Once you have started all desired apps, save the app list so it will respawn after reboot

```
pm2 save
```

### mongodb

- install mongodb

```
https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

- start mongodb

```
sudo systemctl start mongod
```

- verify mongodb start success

```
sudo systemctl status mongod
```

- ensure mongodb start following a system reboot

```
sudo systemctl enable mongod
```

- stop mongodb

```
sudo systemctl stop mongod
```

- restart mongodb

```
sudo systemctl restart mongod
```

- set up mongodb authen

```
https://www.mongodb.com/docs/manual/tutorial/configure-scram-client-authentication/
```

- enable access control
edit file /etc/mongod.conf

```
nano /etc/mongod.conf
```

edit line security

```
security:
 authorization: enabled
```

restart mongod to run with new conf

```
sudo systemctl restart mongod
```

there might be error after enable authen, some reference might be useful:

```
https://stackoverflow.com/questions/76660853/mongodb-fails-to-start
```

- access mongodb

```
mongosh --port 27017
mongosh --port 27017  --authenticationDatabase "admin" -u "myUserAdmin" -p
```

### nginx

- install nginx

```
apt install -y nginx
```

### Copy default nginx config to new file

- Use your own hostname (staging: good-goat-api-staging/good-goat-api-prod)

```
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/good-goat-api-staging
```

- edit above file, update your own server name and port

```
server {
    listen 80;
    server_name api-staging.goodgoat.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- link config file from site sites-available to sites-enable

```
ln -s /etc/nginx/sites-available/good-goat-api-staging /etc/nginx/sites-enabled/good-goat-api-staging
```

- Test config

```
service nginx configtest
```

- Restart nginx start/restart/stop

```
service nginx start
service nginx restart
service nginx stop
```

- Startup default run nginx

```
update-rc.d nginx defaults
```

- check nginx status

```
service nginx status
```

- status working but website can not be reached (if you want to run without SSL follow below, if not, skip this and continue set up SSL)
run below command in server

```
curl -v http://localhost
```

if resposne nginx html page -> good
check firewall

```
sudo ufw status
```

if no port 80 allow

```
sudo ufw allow 80/tcp
```

### Setup SSL for domain

- Enable firewall

```
sudo ufw enable
```

- Enable SSH

```
sudo ufw allow ssh
```

- Allow SSL in nginx

```
ufw allow 'Nginx Full'
```

- if you already add rule to allow port 80 and run without ssl run below command to remove it

```
sudo ufw delete deny 80/tcp
```

- Install cerbot

```
add-apt-repository ppa:certbot/certbot
```

```
apt-get update
```

```
apt-get install python3-certbot-nginx
```

- Test nginx config

```
nginx -t
```

Reload nginx

```
systemctl reload nginx
```

- Apply cerbot to domain (api-staging.goodgoat.com)

```
certbot --nginx -d api-staging.goodgoat.com
```

Choose 1 (no redirect) or 2 (redirect) base on your need
Auto renew SSL certificate

```
certbot renew --dry-run
```
