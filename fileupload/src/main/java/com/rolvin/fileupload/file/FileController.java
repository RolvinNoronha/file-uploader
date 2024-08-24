package com.rolvin.fileupload.file;

import com.rolvin.fileupload.file.dto.UploadDeleteFileResponse;
import com.rolvin.fileupload.file.dto.AllFilesResponse;
import com.rolvin.fileupload.file.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1")
public class FileController
{
    private final FileService fileService;

    @PostMapping("/s3/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("files") MultipartFile[] files
    )
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UploadDeleteFileResponse fileResponse = fileService.uploadFile(files, username);

        if (!fileResponse.isSuccess())
        {
            return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.OK);
    }

    @GetMapping("/files")
    public ResponseEntity<List<AllFilesResponse>> getFiles()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<AllFilesResponse> files = fileService.getFiles(username);
        return new ResponseEntity(files, HttpStatus.OK);
    }

    @GetMapping("/get-url")
    public ResponseEntity<String> getPresignedUrl(@RequestParam("filename") String filename)
    {

        UploadDeleteFileResponse fileResponse = fileService.getPresignedUrl(filename);
        if (!fileResponse.isSuccess())
        {
            return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.OK);
    }

    @GetMapping("/download-file")
    public ResponseEntity<Resource> downloadFile(@RequestParam("filename") String filename, @RequestParam("id") String id) throws IOException {
        try
        {
            Resource resource = fileService.downloadFile(filename);
            if (!resource.exists())
            {
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
            File file = fileService.getFile(Long.parseLong(id));

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=\"" + file.getFileName() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, file.getContentType());
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()));

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
        }
        catch (IOException e)
        {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete-file")
    public ResponseEntity<String> deleteFile(
            @RequestParam("filename") String filename,
            @RequestParam("id") String id
    )
    {
        UploadDeleteFileResponse fileResponse = fileService.deleteFile(filename, Long.parseLong(id));
        if (!fileResponse.isSuccess())
        {
            return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(fileResponse.getMessage(), HttpStatus.OK);
    }
}
