package com.example.HotelBooking.payments.stripe;

import com.example.HotelBooking.payments.stripe.dto.PaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody PaymentRequest paymentRequest){
        String clientSecret = paymentService.createPaymentIntent(paymentRequest);
        return ResponseEntity.ok(Map.of("transactionId", clientSecret));
    }

    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updatePaymentBooking(@RequestBody PaymentRequest paymentRequest){
        try {
            paymentService.updatePaymentBooking(paymentRequest);
            return ResponseEntity.ok(Map.of("message", "Payment updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }


}
