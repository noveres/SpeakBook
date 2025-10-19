package com.example.speakbook_backend.controller;

import com.example.speakbook_backend.Response;
import com.example.speakbook_backend.dto.StudentDTO;
import com.example.speakbook_backend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/student/{id}")
    private StudentDTO getStudentById(@PathVariable long id) {
        return studentService.getStudentById(id);
    };

    @PostMapping("/student")
    private Response<Long> addNewStudent(@RequestBody StudentDTO studentDTO) {
        return Response.newSuccess(studentService.addNewStudent(studentDTO));
    }

}
