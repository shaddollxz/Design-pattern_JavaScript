express配置路由只需要通过`app.method(url,func)`来配置，其中url配置和其中的参数获取方法不同

- 直接写全路径

  路由中允许存在`.`

- get请求传入的参数

  ```javascript
  router.get("/home", (req, res) => {
      res.status(200).send(req.query);
  });
  ```

  通过`/home?a=1`会收到对象：`{a:1}`

- post请求传入的参数

  ```javascript
  app.use(express.json());
  router.post("/about", (req, res) => {
      res.status(200).send(req.body);
  });
  ```

- 加上`:XX`匹配，如下

  ```javascript
  router.get("/home/:id", (req, res) => {
      res.status(200).send(req.params.id);
  });
  ```

  如果有两个相同的命名，后面的会覆盖前面的，如

  ```javascript
  router.get("/a/:id/b/:id", (req, res) => {
      res.status(200).send(req.params);
  });
  ```

  `/a/123/b/456`会得到`{id:456}`

  这种匹配还能通过`. -`两种符号来拆分匹配，如

  ```javascript
  router.get("/:id-:name/:pwd.:end", (req, res) => {
      res.status(200).send(req.params);
  });
  ```

  `/a-bb/123.0`会得到`{"id":"a","name":"bb","pwd":"123","end":"0"}`

- 通过正则表达式，如下

  ```javascript
  router.get("/a+|bb/", (req, res) => {
      res.status(200).send("include a");
  });
  ```

  该路由收到`/aaa /bb`都会返回

  > 在这里`*`与正则的不同 相当于`.*` 应该用`{0,}`来代替`*`
  >
  > 而`.`会被判断为字符所以不能用来匹配

- 在需要多个正则匹配路径，要先命名，并且正则一定要写在括号内，如下

  ```javascript
  router.get("/:name(aaa|bbb)/:id(\\d+)/other", (req, res) => {
      res.status(200).send(req.params);
  });
  ```

  `http://localhost:3000/aaa/99/other`能得到结果`{"name":"aaa","id":"99"}`

- 直接写正则

  只需要路径能匹配上正则就行，同时因为是整个路径匹配，所以不要用`^`来判断前置字符

  ```javascript
  router.get(/aa/, (req, res) => {
      res.status(200).send("get /a/");
  });
  ```

  以上路由能用`/aa /a/b/c/aabv/s`来匹配

- 同一个路由用不同方法响应可以用`route`来链式响应，如

  ```javascript
  router
      .route("/a")
      .get((req, res) => {
          res.status(200).send("get");
      })
      .post((req, res) => {
          res.status(200).send("post");
      });
  ```

  现在`get post`请求都能分别匹配到路由



