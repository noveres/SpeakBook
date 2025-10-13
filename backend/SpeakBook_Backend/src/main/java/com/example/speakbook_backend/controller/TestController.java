package com.example.speakbook_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public List<String> test() {
        return List.of( "Hello", "World" );
    }
}
