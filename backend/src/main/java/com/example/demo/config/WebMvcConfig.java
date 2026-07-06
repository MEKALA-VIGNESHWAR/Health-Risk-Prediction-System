package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMvcConfig - SPA routing.
 * Forwards the React client-side routes to the SPA entry (static/index.html) so
 * deep links and hard refreshes work. API and static asset requests are handled
 * separately and are NOT matched here.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /** Client-side routes owned by React Router. Keep in sync with src/App.tsx. */
    private static final String[] SPA_ROUTES = {
            "/login", "/register",
            "/assistant", "/symptoms",
            "/predictions", "/analytics", "/reports",
            "/nutrition", "/fitness", "/reminders",
            "/profile", "/settings"
    };

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        for (String route : SPA_ROUTES) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
    }
}
