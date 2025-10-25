package com.example.speakbook_backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardController {

    // 攔截根路徑與所有不含 '.' 的子路徑
    @RequestMapping(value = {
            "/{path:^(?!api$|assets$|i18n$|favicon\\.ico$)[^.]*}",
            "/{path:^(?!api$|assets$|i18n$|favicon\\.ico$)[^.]*}/{subPath:[^.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
