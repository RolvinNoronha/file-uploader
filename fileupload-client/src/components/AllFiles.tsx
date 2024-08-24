import {
  Container,
  Flex,
  Input,
  ScrollArea,
  Table,
  Title,
} from "@mantine/core";
import React, { Dispatch, SetStateAction, useState } from "react";
import File from "./File";
import { FileType } from "../pages/Home";

type AllFilesPropsType = {
  files: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  filteredFiles: FileType[];
  setFilteredFiles: Dispatch<SetStateAction<FileType[]>>;
  getFiles: () => void;
};

const AllFiles: React.FC<AllFilesPropsType> = ({
  files,
  filteredFiles,
  setFilteredFiles,
  getFiles,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");

  const filterFilesSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    const ff = files.filter((f) => f.fileName.includes(e.target.value));
    setFilteredFiles(ff);
  };

  return (
    <Container w={"85vw"} p={"xl"}>
      <Title mb={"lg"} ta={"center"}>
        Welcome To FileUploader
      </Title>
      <Input
        value={searchValue}
        onChange={filterFilesSearch}
        variant="filled"
        placeholder="search files"
      />
      {files.length > 0 ? (
        <ScrollArea h={"30rem"}>
          <Table mt={"xl"} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{""}</Table.Th>
                <Table.Th>File Name</Table.Th>
                <Table.Th>Upload Date</Table.Th>
                <Table.Th ta={"center"}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredFiles.length === 0
                ? files.map((file) => {
                    return (
                      <File getFiles={getFiles} key={file.id} file={file} />
                    );
                  })
                : filteredFiles.map((file) => {
                    return (
                      <File getFiles={getFiles} key={file.id} file={file} />
                    );
                  })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Flex justify={"center"} align={"start"} mt={"xl"}>
          <Title order={3} opacity={0.5}>
            You files will appear here
          </Title>
        </Flex>
      )}
    </Container>
  );
};

export default AllFiles;
