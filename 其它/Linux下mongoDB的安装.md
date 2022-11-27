这里只是整理下官网的安装过程，具体详情见[官网](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/#install-mongodb-community-edition-on-red-hat-or-centos)

# 安装

可以使用`yum`或者`.tgz`安装，我这里使用的是`yum`

在`/etc/yum.repos.d`下新建`mongodb-org-5.0.repo`

```
vim etc/yum.repos.d/mongodb-org-5.0.repo
```

再向里面写入这段

```
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
```

这样就可以直接下载了

```
sudo yum install -y mongodb-org
```

# 运行

首先确定`init system`，运行下面代码

```
ps --no-headers -o comm 1
```

会返回两个结果，如果是`systemd`使用

```
sudo systemctl start mongod
sudo systemctl daemon-reload
```

如果是`init`使用

```
sudo service mongod start
```

最后配置以下命令确保mongo会随系统启动

```
sudo systemctl enable mongod
```

> tips:
>
> 配置文件所在目录`/etc/mongod.conf`
>
> 在服务器重启后如果`mongo`无法打开，运行以下命令
>
> ```
> sudo chown mongod:mongod /tmp/mongodb-27017.sock
> ```

## 使用数据库

直接使用`mongosh`命令就可以操作`mongo`

使用`show dbs`查看所有的数据库

使用`use xx`进入数据库

使用`show tables`查看所有表（文档）

然后就可以进行数据库操作了

# 配置

使用`yum`下载的配置文件是`/etc/mongod.conf`通过修改它来配置相应选项

`storage.dbPath`配置数据目录

`systemLog.path`配置日志文件路径 

`net.bbindIp`配置网络接口，默认是`127.0.0.1`，只能本机使用