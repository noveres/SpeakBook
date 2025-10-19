package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.StudentDTO;
import com.example.speakbook_backend.entity.Student;

public interface StudentService {

    StudentDTO getStudentById(long id);

    Long addNewStudent(StudentDTO studentDTO);
}
