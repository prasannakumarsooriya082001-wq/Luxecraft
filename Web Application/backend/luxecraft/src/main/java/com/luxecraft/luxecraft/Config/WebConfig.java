package com.luxecraft.luxecraft.Config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded product images from the upload folder on disk.
 *
 * Previously images were only reachable because they happened to sit in
 * src/main/resources/static, which Spring publishes from the classpath.
 * That meant a freshly uploaded image 404'd until the project was rebuilt.
 * Mapping the real directory here makes new uploads visible immediately.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        String location = uploadPath.toUri().toString();

        // Path.toUri() only appends the trailing slash when the directory
        // already exists. Without it Spring treats the folder as a file and
        // every image 404s, so make sure it is always there.
        if (!location.endsWith("/")) {
            location = location + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
