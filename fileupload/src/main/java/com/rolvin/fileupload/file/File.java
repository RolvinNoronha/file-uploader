package com.rolvin.fileupload.file;

import com.rolvin.fileupload.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "files")
public class File
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileType;
    private String contentType;
    private String fileName;
    private String filePathInS3;
    private LocalDateTime uploadDate;
    private Long fileSize;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
