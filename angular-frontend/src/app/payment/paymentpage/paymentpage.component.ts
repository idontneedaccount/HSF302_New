import { Component } from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements,
} from '@stripe/stripe-js';

import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paymentpage',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paymentpage.component.html',
  styleUrl: './paymentpage.component.css',
})
export class PaymentpageComponent {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  clientSecret: any = null; //uniue transaction id for very transaction
  error: any = null;
  processing: boolean = false;

  bookingReference: string | null = null;
  amount: number | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    
    this.bookingReference =
      this.route.snapshot.paramMap.get('bookingReference');
    this.amount = parseFloat(this.route.snapshot.paramMap.get('amount') || '0');

    console.log('Payment page initialized with:', {
      bookingReference: this.bookingReference,
      amount: this.amount
    });

    // Check if user is authenticated
    if (!this.apiService.isAuthenticated()) {
      this.showError('Please login to complete payment.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }

    if (!this.bookingReference || !this.amount || this.amount <= 0) {
      this.showError('Invalid payment parameters. Please go back and try again.');
      return;
    }

    //load andn initialize the strip.js
    this.stripe = await loadStripe(
      'pk_test_51RnfzqF5Yv9GvVHwVPkxtjvhseMLh15AuuV8iLbPjcPDq7MgHwLjKbPpyGWghUjjIh5CkHHehuitvPgtfxVjZDCk00UwxWavWl'
    );

    if (this.stripe) {
      this.elements = this.stripe.elements({
        appearance: {
          theme: 'stripe'
        }
      });
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
        hidePostalCode: true
      });
      this.cardElement.mount('#card-element');
    }
    //fetch transaction unique id
    this.fetchClientSecrete();
  }

  fetchClientSecrete(): void {
    console.log('Fetching client secret for booking:', this.bookingReference, 'amount:', this.amount);
    
    if (!this.bookingReference || !this.amount) {
      this.showError('Invalid booking reference or amount. Please go back and try again.');
      return;
    }

    const paymentData = {
      bookingReference: this.bookingReference,
      amount: this.amount,
    };

    this.apiService.proceedForPayment(paymentData).subscribe({
      next: (res: any) => {
        console.log('Payment API response:', res);
        console.log('Response type:', typeof res);
        console.log('Response content:', JSON.stringify(res));
        
        if (res && typeof res === 'object' && res.transactionId) {
          this.clientSecret = res.transactionId;
          console.log('Client Secret received:', res.transactionId);
        } else if (typeof res === 'string') {
          // If response is a string, it might be the client secret directly
          this.clientSecret = res;
          console.log('Client Secret received as string:', res);
        } else {
          console.error('Invalid response format:', res);
          this.showError('Invalid response from payment service. Please try again.');
        }
      },
      error: (err: any) => {
        console.error('Payment API error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        
        if (err.status === 401) {
          this.showError('Please login to complete payment.');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.showError(
            err?.error?.message || err?.message || 'Failed to initialize payment. Please check your booking reference and try again.'
          );
        }
      },
    });
  }

  showError(msg: any): void {
    this.error = msg;
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }


    ///This is the method to call when a user click on pay now after he has filled his card details
  async handleSubmit(event: Event) {
    event.preventDefault();
    console.log("PAY Button was clicked")

    // Check if all required components are ready
    if (!this.stripe) {
        this.showError("Payment system is loading. Please wait and try again.")
        return;
    }

    if (!this.elements || !this.cardElement) {
        this.showError("Card input is not ready. Please refresh the page and try again.")
        return;
    }

    if (!this.clientSecret) {
        this.showError("Transaction not initialized. Please refresh the page and try again.")
        return;
    }

    if (this.processing) {
        this.showError("Payment is already being processed. Please wait.")
        return;
    }

    this.processing = true;

    const {error, paymentIntent} = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.cardElement!,
        },
      }
    );

    if(paymentIntent && paymentIntent.status === 'succeeded'){
      
      this.processing = false;
      console.log("Payment intend id is: " + paymentIntent.id);
      this.handleUpdateBookingPayment('succeeded', paymentIntent.id); // update the boking status in the backend and send email to the user of the status
      this.router.navigate([`/payment-success/${this.bookingReference}`]);
    }
    else if (error){

      console.log('PAYMENT ERROR: ' + error);
      this.processing = false;
      this.handleUpdateBookingPayment('failed', '', error.message);// update the boking status in the backend and send email to the user of the status
      this.showError(error?.message || error || 'PAYMENT ERROR');
    }else{
      this.showError(
        'Unable to process transaction at the moment. Please Try Again!'
      );
    }
  }

  handleUpdateBookingPayment(
    paymentStatus: string,
    transactionId: string = '',
    failureReason: string = ''
  ) {
    console.log('INSIDE handlePaymentStatus()');
    if (!this.bookingReference || !this.amount) return;

    console.log('BOOKING REFERENCE: ' + this.bookingReference);
    console.log('BOOKING AMOUNT IS: ' + this.amount);

    console.log('Payment status is: ' + paymentStatus);
    console.log('transactionId IS: ' + transactionId);
    console.log('failureReason IS: ' + failureReason);

    const paymentData = {
      bookingReference: this.bookingReference,
      amount: this.amount,
      transactionId,
      success: paymentStatus === 'succeeded',
      failureReason,
    };

    this.apiService.updateBookingPayment(paymentData).subscribe({
      next: (res: any) => {
        console.log(res);
      },
      error: (err) => {
        this.showError(
          err?.error?.message || err?.message || 'Error updating payment status'
        );
        console.error(err);
      },
    });
  }



}
