package com.example.demo.ai;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * WebClient tuned for the OpenAI REST API. A long response timeout accommodates
 * streaming completions; the in-memory buffer is raised for non-streaming JSON.
 */
@Configuration
public class OpenAiConfig {

    @Bean("openAiWebClient")
    public WebClient openAiWebClient(AiProperties props) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(90));

        return WebClient.builder()
                .baseUrl(props.getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }
}
