package com.rolvin.fileupload.file.service;

import com.rolvin.fileupload.file.File;
import com.rolvin.fileupload.file.dto.UploadDeleteFileResponse;
import com.rolvin.fileupload.file.dto.AllFilesResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService
{
    UploadDeleteFileResponse uploadFile(MultipartFile[] files, String username);
    List<AllFilesResponse> getFiles(String email);
    UploadDeleteFileResponse getPresignedUrl(String filename);
    UploadDeleteFileResponse deleteFile(String filename, Long id);
    Resource downloadFile(String filename) throws IOException;
    File getFile(Long id);
}
