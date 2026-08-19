package com.luxecraft.luxecraft.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class FileUploadService {

    private static final Logger log = LoggerFactory.getLogger(FileUploadService.class);

    /**
     * Where uploaded product images live.
     *
     * This used to be a hardcoded path inside src/main/resources/static.
     * That broke twice over: the path pointed at another machine's drive,
     * and files written into the source tree are not served at runtime
     * anyway - Spring serves static content from the classpath copy in
     * target/classes, so a new upload only appeared after a rebuild.
     *
     * Uploads are runtime data, so they now live in their own folder
     * outside the source tree and are served by WebConfig.
     */
    @Value("${app.upload.dir}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    void init() throws IOException {

        uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadPath);

        log.info("Product images will be stored in {}", uploadPath);
    }

    public String uploadImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            return null;
        }

        String original = Paths.get(
                file.getOriginalFilename() == null
                        ? "image"
                        : file.getOriginalFilename())
                .getFileName()
                .toString();

        String fileName = UUID.randomUUID() + "_" + original;

        Path target = uploadPath.resolve(fileName).normalize();

        // Refuse anything that would escape the upload folder
        if (!target.startsWith(uploadPath)) {
            throw new IOException("Invalid file name: " + original);
        }

        Files.copy(
                file.getInputStream(),
                target,
                StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored upload {}", fileName);

        return fileName;
    }
}
