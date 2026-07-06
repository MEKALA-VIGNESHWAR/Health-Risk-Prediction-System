package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class RootController {
    
    @GetMapping("/")
    public String index() {
        // Serve the React SPA entry point (built into static/index.html).
        return "forward:/index.html";
    }
    
    @GetMapping("/favicon.ico")
    public RedirectView favicon() {
        return new RedirectView("data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    }
}
