数字签名验证检验标准

example

```json
{
    "error": null,
    "has_signature": true,
    "signature_count": 1,
    "signatures": [
        {
            "signature_index": 0,
            "is_trusted_cert": true,
            "signing_cert_subject": "Common Name: Orchanger, Organization: Orchanger Co Ltd, Email Address: service@orchanger.com, Country: CN",
            "valid": true,
            "intact": true,
            "signing_time": "2025-06-05T22:09:24+08:00",
            "coverage": "SignatureCoverageLevel.ENTIRE_FILE"
        }
    ]
}
```

我们的UI显示是，先显示总体结论（验签通过/无法验证），再显示每个签名的结果详情。每个签名的详情是折叠的。可以展开单个签名的验证结果查看。

只有每个签名验证都PASS，才表明验签通过。

对于每个签名的验证，会显示多个子块

- 证书可信性："is_trusted_cert" == true
- 签名有效性："valid" == true && "intact" == true  
- 签名覆盖性: "coverage" == "SignatureCoverageLevel.ENTIRE_FILE"(绿色，PASS) or "coverage" == "SignatureCoverageLevel.ENTIRE_REVISION"（蓝色，PASS），其他算 未完全覆盖文件

只有上面三个块全部PASS，且签名覆盖性 只有 ENTIRE_FILE or ENTIRE_REVISION, 且 至少有一个签名coverage 是 ENTIRE_FILE，这个签名才会 PASS。

签名详情还会写 签发时间，签发 subject

其中 签发 subject:  "Common Name: Orchanger, Organization: Orchanger Co Ltd, Email Address: service@orchanger.com, Country: CN" 可以优雅地显示 key（无需翻译） -value。需要注意不是每个 key 都百分百会写。

只有每个签名验证都PASS，才表明验签通过。

对于服务器如果返回的是error 的情况，折叠ERROR消息，但依然报告无法验证。


