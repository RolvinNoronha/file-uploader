package com.rolvin.fileupload.file.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AllFilesResponse
{
    private Long id;
    private String fileName;
    private String filePathInS3;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private Long userId;
}
