package com.luxecraft.luxecraft.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.ContactRequest;

@Service
public class ContactService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendContactMessage(ContactRequest request) {

        SimpleMailMessage message = new SimpleMailMessage();

        // Your LuxeCraft mail
        message.setTo("YOUR_LUXECRAFT_EMAIL@gmail.com");

        message.setSubject(
                "LuxeCraft Contact: " + request.getSubject());

        message.setText(
                "New Contact Message\n\n"
                        + "Name: " + request.getName() + "\n"
                        + "Customer Email: " + request.getEmail() + "\n"
                        + "Subject: " + request.getSubject() + "\n\n"
                        + "Message:\n"
                        + request.getMessage()
                        + "\n\n"
                        + "Regards,\n"
                        + "LuxeCraft Website");

        mailSender.send(message);
    }
}