import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiError } from '../../core/models/api.model';
import { Booking } from '../../core/models/dashboard.model';
import { AnimationCleanup, AnimationService } from '../../core/services/animation.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ErrorService } from '../../core/services/error.service';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

type VehicleType = 'car' | 'bike';
interface ServiceItem { count: string; title: string; titleBreak: string; description: string; bullets: string[]; image: string; label: string; service: string; subline: string; }
interface PackageItem { number: string; eyebrow: string; name: string; description: string; carPrice: number; bikePrice: number; features: string[]; featured?: boolean; }

@Component({
  selector: 'app-home', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent, FormErrorComponent],
  templateUrl: './home.component.html', styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly animations = inject(AnimationService);
  private readonly api = inject(ApiService);
  private readonly errors = inject(ErrorService);
  private animationCleanup?: AnimationCleanup;
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly menuOpen = signal(false);
  readonly bookingOpen = signal(false);
  readonly bookingSuccess = signal(false);
  readonly quickSubmitting = signal(false);
  readonly bookingSubmitting = signal(false);
  readonly toastMessage = signal('');
  readonly vehicleType = signal<VehicleType>('car');
  readonly serviceIndex = signal(0);
  readonly pricingType = signal<VehicleType>('car');
  readonly comparisonValue = signal(52);
  readonly openFaq = signal(0);
  readonly headerScrolled = signal(false);
  readonly showBackToTop = signal(false);
  readonly scrollProgress = signal(0);
  readonly currentYear = new Date().getFullYear();
  readonly minDate = new Date().toISOString().split('T')[0];

  readonly serviceData: Record<VehicleType, ServiceItem[]> = {
    car: [
      { count: '01 / 03', title: 'Exterior', titleBreak: 'Foam Wash', description: 'Pre-rinse, pH-safe snow foam, careful hand wash, wheels and tyres cleaned, followed by streak-free drying.', bullets: ['Paint-safe foam', 'Wheel and tyre care', 'Microfibre hand finish'], image: 'https://images.pexels.com/photos/4876676/pexels-photo-4876676.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Exterior', service: 'Exterior Foam Wash', subline: 'Clean, rinse, dry' },
      { count: '02 / 03', title: 'Interior', titleBreak: 'Deep Clean', description: 'Thorough vacuuming, upholstery and carpet cleaning, dashboard care, glass cleaning and a fresher-feeling cabin.', bullets: ['Seat and carpet care', 'Dashboard conditioning', 'Cabin vacuuming'], image: 'https://images.pexels.com/photos/6872148/pexels-photo-6872148.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Interior', service: 'Interior Deep Clean', subline: 'Seats, carpet, cabin' },
      { count: '03 / 03', title: 'Paint', titleBreak: 'Correction', description: 'Surface decontamination and machine polishing designed to improve gloss, clarity and the appearance of light defects.', bullets: ['Surface decontamination', 'Machine polish', 'Gloss protection'], image: 'https://images.pexels.com/photos/6873020/pexels-photo-6873020.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Restoration', service: 'Paint Correction', subline: 'Restore gloss and clarity' },
    ],
    bike: [
      { count: '01 / 03', title: 'Bike', titleBreak: 'Foam Wash', description: 'Careful foam wash for painted panels, wheels and accessible areas, followed by controlled drying and finishing.', bullets: ['Gentle foam wash', 'Wheel cleaning', 'Detailed drying'], image: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Bike wash', service: 'Bike Foam Wash', subline: 'Panels, wheels, dry' },
      { count: '02 / 03', title: 'Engine &', titleBreak: 'Chain Care', description: 'Focused degreasing and cleaning around the engine and chain area, followed by suitable finishing and lubrication guidance.', bullets: ['Targeted degreasing', 'Chain-area cleaning', 'Careful finishing'], image: 'https://images.pexels.com/photos/104842/bmw-vehicle-ride-bike-104842.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Mechanical care', service: 'Engine & Chain Care', subline: 'Degrease, clean, finish' },
      { count: '03 / 03', title: 'Polish &', titleBreak: 'Protection', description: 'Paint and trim refinement that restores shine and adds a protective finish to exposed surfaces.', bullets: ['Paint refinement', 'Trim conditioning', 'Protective finish'], image: 'https://images.pexels.com/photos/2393821/pexels-photo-2393821.jpeg?auto=compress&cs=tinysrgb&w=1400', label: 'Protection', service: 'Bike Polish & Protection', subline: 'Refine, condition, protect' },
    ],
  };

  readonly packages: PackageItem[] = [
    { number: '01', eyebrow: 'Quick refresh', name: 'Essential Wash', description: 'For regular maintenance and a crisp exterior finish.', carPrice: 699, bikePrice: 299, features: ['Exterior foam wash', 'Wheel and tyre cleaning', 'Dashboard wipe', 'Glass cleaning', 'Microfibre drying'] },
    { number: '02', eyebrow: 'Inside and out', name: 'Complete Detail', description: 'A full cabin reset with careful exterior cleaning and finishing.', carPrice: 1499, bikePrice: 699, features: ['Everything in Essential', 'Interior vacuuming', 'Seat and carpet cleaning', 'Dashboard conditioning', 'Tyre dressing'], featured: true },
    { number: '03', eyebrow: 'Maximum restoration', name: 'Signature Protection', description: 'Deeper restoration, gloss enhancement and longer-lasting protection.', carPrice: 3999, bikePrice: 1699, features: ['Everything in Complete Detail', 'Clay-bar decontamination', 'Machine polishing', 'Paint sealant', 'Detailed final inspection'] },
  ];

  readonly faqs = [
    { q: 'How often should I wash my car or bike?', a: 'For normal city use, an exterior wash every two to three weeks is sensible. Interior deep cleaning is usually useful every three to six months, depending on use.' },
    { q: 'Do you bring water and electricity?', a: 'Service requirements vary by package and location. Our team confirms water and power requirements when your booking is verified.' },
    { q: 'Are the products safe for paint and alloy wheels?', a: 'Yes. We use vehicle-specific products and appropriate tools for paint, glass, plastic trim, tyres and alloy wheels.' },
    { q: 'Can you clean the complete interior?', a: 'Interior packages can include vacuuming, seats, carpets, mats, dashboard, panels, glass and odour treatment. Exact inclusions are listed during booking.' },
    { q: 'How long does a service take?', a: 'A maintenance wash may take 45 to 75 minutes. Full detailing and polishing can take several hours depending on vehicle size and condition.' },
  ];

  readonly quickForm = this.fb.nonNullable.group({
    vehicle: ['', Validators.required], service: ['', Validators.required], phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]],
  });
  readonly bookingForm = this.fb.nonNullable.group({
    name: ['', Validators.required], phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]], vehicle: ['', Validators.required], service: ['', Validators.required], date: ['', Validators.required], time: ['', Validators.required], address: ['', Validators.required],
  });

  get currentService(): ServiceItem { return this.serviceData[this.vehicleType()][this.serviceIndex()]; }
  priceFor(item: PackageItem): string { return (this.pricingType() === 'car' ? item.carPrice : item.bikePrice).toLocaleString('en-IN'); }

  ngAfterViewInit(): void {
    this.animationCleanup = this.animations.initHome(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.animationCleanup?.destroy();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.document.body.classList.remove('modal-open');
  }

  @HostListener('window:scroll') onScroll(): void {
    const y = window.scrollY;
    const max = this.document.documentElement.scrollHeight - window.innerHeight;
    this.headerScrolled.set(y > 30);
    this.showBackToTop.set(y > 650);
    this.scrollProgress.set(max > 0 ? (y / max) * 100 : 0);
  }

  setVehicle(type: VehicleType): void { this.vehicleType.set(type); this.serviceIndex.set(0); this.animations.animateServiceSwap(this.element.nativeElement); }
  selectService(index: number): void { this.serviceIndex.set(index); this.animations.animateServiceSwap(this.element.nativeElement); }
  setPricing(type: VehicleType): void { this.pricingType.set(type); this.animations.animatePrices(this.element.nativeElement); }
  toggleFaq(index: number): void { this.openFaq.set(this.openFaq() === index ? -1 : index); }
  scrollTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  openBooking(service = ''): void {
    this.bookingSuccess.set(false);
    if (service) this.bookingForm.controls.service.setValue(service);
    this.bookingOpen.set(true);
    this.document.body.classList.add('modal-open');
  }

  closeBooking(): void {
    this.bookingOpen.set(false);
    this.document.body.classList.remove('modal-open');
    setTimeout(() => { this.bookingForm.reset(); this.bookingSuccess.set(false); }, 200);
  }

  submitQuick(): void {
    this.quickForm.markAllAsTouched();
    if (this.quickForm.invalid || this.quickSubmitting()) return;
    this.quickSubmitting.set(true);
    this.api.post<{ message?: string }>('callbacks', this.quickForm.getRawValue(), { silentError: true })
      .pipe(finalize(() => this.quickSubmitting.set(false)))
      .subscribe({
        next: result => {
          this.showToast(result.message || 'Callback request received. We will contact you shortly.');
          this.quickForm.reset();
        },
        error: (error: ApiError) => this.errors.error(error.message),
      });
  }

  submitBooking(): void {
    this.bookingForm.markAllAsTouched();
    if (this.bookingForm.invalid || this.bookingSubmitting()) return;
    this.bookingSubmitting.set(true);
    const value = this.bookingForm.getRawValue();
    this.api.post<Booking>('bookings', {
      customer: value.name, service: value.service, vehicle: value.vehicle,
      date: value.date, time: value.time, address: value.address,
    }, { silentError: true }).pipe(finalize(() => this.bookingSubmitting.set(false))).subscribe({
      next: () => this.bookingSuccess.set(true),
      error: (error: ApiError) => {
        this.errors.applyServerErrors(this.bookingForm, error.validationErrors);
        this.errors.error(error.message);
      },
    });
  }

  goToDashboard(): void { this.router.navigateByUrl(this.auth.dashboardUrl()); }
  logout(): void { this.auth.logout(); this.showToast('You have been logged out.'); }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(''), 3600);
  }

}
