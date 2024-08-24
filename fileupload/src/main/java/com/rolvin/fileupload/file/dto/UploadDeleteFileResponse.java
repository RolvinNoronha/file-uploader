package com.rolvin.fileupload.file.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class UploadDeleteFileResponse
{
    private String message;
    private boolean isSuccess;
}
