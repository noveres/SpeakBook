package com.example.speakbook_backend.service;

import com.example.speakbook_backend.converter.StudentConverter;
import com.example.speakbook_backend.dao.StudentRepository;
import com.example.speakbook_backend.dto.StudentDTO;
import com.example.speakbook_backend.entity.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;


    @Override
    public StudentDTO getStudentById(long id) {
        Student student = studentRepository.findById(id).orElseThrow(
                RuntimeException::new
        );
        return StudentConverter.convertStudent(student);
    }

    @Override
    public Long addNewStudent(StudentDTO studentDTO) {
       List<Student> studentList = studentRepository.findByEmail(studentDTO.getEmail());
       if (!CollectionUtils.isEmpty(studentList)) {
           throw new IllegalArgumentException("Email：" + studentDTO.getEmail() + " has been taken");

       }
        Student student = studentRepository.save(StudentConverter.convertStudentDTO(studentDTO));
       return student.getId();
    }
}
