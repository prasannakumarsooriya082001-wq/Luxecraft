package com.luxecraft.luxecraft.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.luxecraft.luxecraft.Model.ContactRequest;
import com.luxecraft.luxecraft.Service.ContactService;

@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(
            @RequestBody ContactRequest request) {

        try {

            contactService.sendContactMessage(request);

            return ResponseEntity.ok(
                    "Message sent successfully");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Failed to send message");
        }
    }
}