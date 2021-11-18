# 准备

下载好`nginx node npm pm2 git`

把服务器代码通过`git`拉到服务器上，然后`npm i`安装依赖，我这里是直接在根目录新建了一个`www`文件夹，在这里拉的代码

# 配置`nginx`

通过`yum`下载的`nginx`默认配置路径为`/etc/nginx/nginx.conf`，在同目录下还有个`conf.d`文件夹，这里面的`.conf`配置文件都会并入`nginx.conf`中

## 设置静态资源

进入`conf.d`中的`default.conf`配置网站静态资源

```
# 配置监听端口
listen       80;
server_name  localhost;

# 配置网页根目录 这里写自己的前端代码的index.html
location / {
    root   /www/my-blog/server/public;
    index  index.html;
}
```

然后启动`nginx`：只需要执行`nginx`即可



## 设置node接口

如果node项目的监听在3000端口，这时还需要配置代理到3000端口

```
# 配置根目录
location / {
	root   /www/my-blog/server/public;
	index  index.html;
	proxy_pass http://localhost:3000; # 这里不要在最后加上/
}

```
## 设置代理

如果使用`vue`项目的话，一般会在开发时使用代理服务器，即一般需要在`vue.config.js`中配置代理，用`/api/xxx`进行请求，到正式上线时就需要修改`nginx`中的配置，在生产环境中也能正确请求到后端接口

```
# 配置代理
location /api/ {
	proxy_pass http://localhost:3000/; # 这里写后端的监听接口
	add_header X-Slave $upstream_addr;
	proxy_redirect off;
	proxy_set_header Host $host;
	proxy_set_header X-Real_Ip $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```


**更多`nginx`命令：**

| 命令              | 说明                 |
| ----------------- | -------------------- |
| `nginx -t`        | 确认配置文件是否正确 |
| `nginx -s stop`   | 强制关闭               |
| `nginx -s quit` |关闭 该命令会在请求处理完后关闭 更应该使用这个|
| `nginx -s reload` | 重新加载配置文件          |

# 运行node项目

进入到项目根目录，然后使用`pm2`运行`app.js`

```
pm2 start app.js --name blog    // 这里将app命令为blog并启动的
```

然后就部署好了

**更多`pm2`命令：**

| 命令                      | 说明                            |
| ------------------------- | ------------------------------- |
| `pm2 list`                | 查看所有进程状态                |
| `pm2 monit`               | 监视所有进程                    |
| `pm2 logs`                | 显示所有进程日志                |
| `pm2 stop all`            | 停止所有进程                    |
| `pm2 restart all`         | 重启所有进程                    |
| `pm2 delete all`          | 杀死全部进程                    |
| `pm2 start app.js -i max` | 根据有效CPU数目启动最大进程数目 |

# 将http跳转到https

如果配置了`https`后想要将`http`请求跳转到`https`需要将80端口和443端口分别配置：

```
# https的配置
server {
    # 配置https http会重写到这里
    listen 443  ssl;
    server_name 47.100.29.57;
  
    # 配置ssl
    ssl_certificate cert/6513873_www.shaddollxz.space.pem;
    ssl_certificate_key cert/6513873_www.shaddollxz.space.key;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    # 配置根目录
    location / {
        root   /www/my-blog/server/public;
        index  index.html;
	    proxy_pass http://localhost:3000;
        try_files $uri $uri/ /index.html;
    }

    # 配置ajax代理
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
	    proxy_pass http://localhost:3000/;
        add_header X-Slave $upstream_addr;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real_Ip $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 配置静态资源代理
    location /assets/ {
	    proxy_pass http://localhost:3000;
    }
}
```

```
# 配置http
server{
    # 配置http请求重写到https上
    listen 80;
    server_name 47.100.29.57;
    rewrite ^(.*)$ https://$host$1 permanent; #将所有HTTP请求通过rewrite指令重定向到HTTPS
}
```

