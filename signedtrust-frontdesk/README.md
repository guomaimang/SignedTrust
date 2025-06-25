## 伪静态配置

```
    location / {
        try_files $uri /index.html;
    }
```