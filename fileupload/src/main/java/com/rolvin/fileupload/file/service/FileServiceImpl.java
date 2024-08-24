package com.rolvin.fileupload.file.service;

import com.rolvin.fileupload.file.File;
import com.rolvin.fileupload.file.FileRepository;
import com.rolvin.fileupload.file.dto.UploadDeleteFileResponse;
import com.rolvin.fileupload.file.dto.AllFilesResponse;
import com.rolvin.fileupload.user.User;
import com.rolvin.fileupload.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.utils.IoUtils;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService
{
    @Value("${aws.s3.bucketName}")
    private String bucketName;

    @Value("${aws.s3.accessKey}")
    private String accessKey;

    @Value("${aws.s3.secretKey}")
    private String secretKey;

    private Region region = Region.AP_SOUTH_1;

    private S3Client s3Client;

    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    @PostConstruct
    private void initialize() {
        AwsCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        s3Client = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .region(region)
                .build();

    }

    @Override
    public UploadDeleteFileResponse uploadFile(MultipartFile[] files, String username) {

        User user = userRepository.findByEmail(username).orElse(null);
        for (MultipartFile file: files)
        {
            String fileType = "";
            String contentType = file.getContentType();

            if (contentType.contains("pdf")) {
                fileType = "pdfs";
            } else if (contentType.contains("video")) {
                fileType = "videos";
            } else if (contentType.contains("audio")) {
                fileType = "audios";
            } else if (contentType.contains("image")) {
                fileType = "images";
            }
            LocalDateTime dateTime = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss:ms");
            String[] parts = file.getOriginalFilename().split("\\.");

            String newFileName = parts[0] + "-" + dateTime.format(formatter) + "." + parts[1];

            String filePath = username + "/" + fileType + "/" + newFileName;
            try {
                PutObjectRequest objectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(filePath)
                        .contentType(file.getContentType())
                        .build();

//            AsyncRequestBody asyncRequestBody = AsyncRequestBody.fromBytes(multipartFile.getBytes());

                PutObjectResponse putObjectResponse = s3Client.putObject(objectRequest, RequestBody.fromBytes(file.getBytes()));
                File saveFile = File.builder()
                        .fileName(file.getOriginalFilename())
                        .filePathInS3(filePath)
                        .fileType(fileType)
                        .contentType(file.getContentType())
                        .uploadDate(dateTime)
                        .fileSize(file.getSize())
                        .user(user)
                        .build();

                fileRepository.save(saveFile);

            }
            catch (Exception e)
            {
                return UploadDeleteFileResponse.builder().message(e.getMessage()).isSuccess(false).build();
            }
        }
        return UploadDeleteFileResponse.builder().message("successfully uploaded files").isSuccess(true).build();
    }

    @Override
    public List<AllFilesResponse> getFiles(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        List<File> files = fileRepository.findByUserId(user.getId());

        return files.stream()
                .map(file -> AllFilesResponse.builder()
                        .id(file.getId())
                        .fileName(file.getFileName())
                        .filePathInS3(file.getFilePathInS3())
                        .fileType(file.getFileType())
                        .fileSize(file.getFileSize())
                        .userId(user.getId())
                        .uploadDate(file.getUploadDate())
                        .build()
                )
                .collect(Collectors.toList());
    }

    public File getFile(Long id)
    {
        return fileRepository.findById(id).orElse(null);
    }

    @Override
    public UploadDeleteFileResponse getPresignedUrl(String filename)
    {
        try (S3Presigner presigner = S3Presigner.create()) {

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))  // The URL will expire in 10 minutes.
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);

            return UploadDeleteFileResponse.builder().message(presignedRequest.url().toExternalForm()).isSuccess(true).build();
        }
        catch (Exception e)
        {
            return UploadDeleteFileResponse.builder().message(e.getMessage()).isSuccess(false).build();
        }
    }

    @Override
    public UploadDeleteFileResponse deleteFile(String filename, Long id)
    {
        try {

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);


            fileRepository.deleteById(id);
            return UploadDeleteFileResponse.builder().message("successfully uploaded files").isSuccess(true).build();
        } catch (Exception e) {

           return UploadDeleteFileResponse.builder().message(e.getMessage()).isSuccess(false).build();
        }
    }

    @Override
    public Resource downloadFile(String filename) throws IOException {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .build();
        ResponseInputStream<GetObjectResponse> getObjectResponse = s3Client.getObject(objectRequest);

        byte[] bytes = IoUtils.toByteArray(getObjectResponse);

        return new ByteArrayResource(bytes);
    }


}
