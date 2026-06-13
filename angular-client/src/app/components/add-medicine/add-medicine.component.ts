import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { CreateMedicineDto } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-add-medicine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/medications" class="btn btn-circle btn-ghost hover:bg-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-6 w-6 text-gray-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
            Add New Medicine
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Add a new medication to your schedule</p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
        <form [formGroup]="medicineForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <!-- Medicine Name -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Medicine Name *</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="e.g., Aspirin, Metformin, etc."
              [class.input-error]="medicineForm.get('name')?.touched && medicineForm.get('name')?.invalid"
            />
            @if (medicineForm.get('name')?.touched && medicineForm.get('name')?.invalid) {
              <span class="text-error text-xs font-bold mt-1">Medicine name is required</span>
            }
          </div>

          <!-- Dosage -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Dosage</span>
            </label>
            <input
              type="text"
              formControlName="dosage"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="e.g., 500mg, 1 tablet, etc."
            />
          </div>

          <!-- Instructions -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Instructions</span>
            </label>
            <textarea
              formControlName="instructions"
              class="textarea textarea-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              placeholder="e.g., Take after meals, etc."
              rows="2"
            ></textarea>
          </div>

          <!-- Frequency -->
          <div class="form-control">
            <label class="label flex flex-col items-start gap-1">
              <span class="label-text font-bold text-gray-700">Frequency (Morning-Afternoon-Evening) *</span>
              <span class="label-text-alt text-gray-400">Select when to take each dose</span>
            </label>
            <div class="grid grid-cols-3 gap-4 mt-2">
              <label class="label cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300"
                     [ngClass]="{
                       'border-indigo-500 bg-indigo-50/50': isDoseSelected(0),
                       'border-gray-200 hover:border-indigo-200': !isDoseSelected(0)
                     }">
                <input type="checkbox" class="checkbox checkbox-primary checkbox-md rounded-lg" [checked]="isDoseSelected(0)" (change)="toggleDose(0)" />
                <span class="label-text font-bold text-gray-700">Morning</span>
              </label>
              <label class="label cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300"
                     [ngClass]="{
                       'border-indigo-500 bg-indigo-50/50': isDoseSelected(1),
                       'border-gray-200 hover:border-indigo-200': !isDoseSelected(1)
                     }">
                <input type="checkbox" class="checkbox checkbox-primary checkbox-md rounded-lg" [checked]="isDoseSelected(1)" (change)="toggleDose(1)" />
                <span class="label-text font-bold text-gray-700">Afternoon</span>
              </label>
              <label class="label cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300"
                     [ngClass]="{
                       'border-indigo-500 bg-indigo-50/50': isDoseSelected(2),
                       'border-gray-200 hover:border-indigo-200': !isDoseSelected(2)
                     }">
                <input type="checkbox" class="checkbox checkbox-primary checkbox-md rounded-lg" [checked]="isDoseSelected(2)" (change)="toggleDose(2)" />
                <span class="label-text font-bold text-gray-700">Evening</span>
              </label>
            </div>
            @if (medicineForm.get('frequency')?.invalid && medicineForm.get('frequency')?.touched) {
              <span class="text-error text-xs font-bold mt-1">Please select at least one dose time</span>
            }
          </div>

          <!-- Reminder Times -->
          <div class="form-control">
            <label class="label flex flex-col items-start gap-1">
              <span class="label-text font-bold text-gray-700">Reminder Times</span>
              <span class="label-text-alt text-gray-400">Set specific times for reminders (optional)</span>
            </label>
            <div formArrayName="scheduledTimes" class="space-y-2 mt-2">
              @for (control of scheduledTimesArray.controls; track $index) {
                <div class="flex gap-2">
                  <input
                    type="time"
                    [formControlName]="$index"
                    class="input input-bordered flex-1 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  />
                  <button type="button" (click)="removeScheduledTime($index)" class="btn btn-square btn-error btn-outline hover:bg-red-500 hover:text-white rounded-xl" *ngIf="scheduledTimesArray.length > 1">
                    ✕
                  </button>
                </div>
              }
            </div>
            <button type="button" (click)="addScheduledTime()" class="btn btn-sm btn-outline btn-primary rounded-xl mt-3 flex items-center gap-1 font-bold">
              <span>+</span> Add Time
            </button>
          </div>

          <!-- Duration & Pills Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Duration -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Duration (Days) *</span>
              </label>
              <input
                type="number"
                formControlName="durationDays"
                class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., 30"
                min="1"
                [class.input-error]="medicineForm.get('durationDays')?.touched && medicineForm.get('durationDays')?.invalid"
              />
              @if (medicineForm.get('durationDays')?.touched && medicineForm.get('durationDays')?.invalid) {
                <span class="text-error text-xs font-bold mt-1">Duration is required</span>
              }
            </div>

            <!-- Total Pills -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Total Pills *</span>
              </label>
              <input
                type="number"
                formControlName="totalPills"
                class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., 30"
                min="1"
                [class.input-error]="medicineForm.get('totalPills')?.touched && medicineForm.get('totalPills')?.invalid"
              />
              @if (medicineForm.get('totalPills')?.touched && medicineForm.get('totalPills')?.invalid) {
                <span class="text-error text-xs font-bold mt-1">Total pills is required</span>
              }
            </div>

            <!-- Pills Per Dose -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Pills Per Dose *</span>
              </label>
              <input
                type="number"
                formControlName="pillsPerDose"
                class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., 1"
                min="1"
                [class.input-error]="medicineForm.get('pillsPerDose')?.touched && medicineForm.get('pillsPerDose')?.invalid"
              />
              @if (medicineForm.get('pillsPerDose')?.touched && medicineForm.get('pillsPerDose')?.invalid) {
                <span class="text-error text-xs font-bold mt-1">Required</span>
              }
            </div>

            <!-- Doses Per Day -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Doses Per Day *</span>
              </label>
              <input
                type="number"
                formControlName="dosesPerDay"
                class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., 2"
                min="1"
                [class.input-error]="medicineForm.get('dosesPerDay')?.touched && medicineForm.get('dosesPerDay')?.invalid"
              />
              @if (medicineForm.get('dosesPerDay')?.touched && medicineForm.get('dosesPerDay')?.invalid) {
                <span class="text-error text-xs font-bold mt-1">Required</span>
              }
            </div>
          </div>

          <!-- Start Date -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-bold text-gray-700">Start Date *</span>
            </label>
            <input
              type="date"
              formControlName="startDate"
              class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
              [class.input-error]="medicineForm.get('startDate')?.touched && medicineForm.get('startDate')?.invalid"
            />
            @if (medicineForm.get('startDate')?.touched && medicineForm.get('startDate')?.invalid) {
              <span class="text-error text-xs font-bold mt-1">Start date is required</span>
            }
          </div>

          <!-- Error Message -->
          @if (errorMessage) {
            <div class="alert alert-error rounded-xl shadow-md flex gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-bold text-sm">{{ errorMessage }}</span>
            </div>
          }

          <!-- Submit Buttons -->
          <div class="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              routerLink="/medications"
              class="btn btn-outline flex-1 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white border-0 hover:opacity-95 font-bold flex-1 rounded-2xl shadow-lg transition-opacity"
              [disabled]="medicineForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="loading loading-spinner"></span>
              } @else {
                Add Medicine
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddMedicineComponent {
  medicineForm: FormGroup;
  scheduledTimesArray: FormArray;
  errorMessage = '';
  isLoading = false;
  doseSelection = [false, false, false]; // Morning, Afternoon, Evening
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private medicineService: MedicineService,
    private authService: AuthService
  ) {
    this.scheduledTimesArray = this.fb.array(['08:00', '14:00', '20:00']);
    this.medicineForm = this.fb.group({
      name: ['', Validators.required],
      dosage: [''],
      instructions: [''],
      frequency: ['0-0-0', Validators.required],
      scheduledTimes: this.scheduledTimesArray,
      durationDays: [0, [Validators.required, Validators.min(1)]],
      originalDurationDays: [0],
      totalPills: [0, [Validators.required, Validators.min(1)]],
      originalTotalPills: [0],
      pillsPerDose: [1, [Validators.required, Validators.min(1)]],
      dosesPerDay: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      appUserId: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/add-medicine' } });
      return;
    }

    this.medicineForm.patchValue({
      appUserId: this.currentUser.id,
      originalDurationDays: this.medicineForm.value.durationDays,
      originalTotalPills: this.medicineForm.value.totalPills,
      startDate: new Date().toISOString().split('T')[0]
    });
  }

  addScheduledTime(): void {
    this.scheduledTimesArray.push(this.fb.control(''));
  }

  removeScheduledTime(index: number): void {
    this.scheduledTimesArray.removeAt(index);
  }

  isDoseSelected(index: number): boolean {
    return this.doseSelection[index];
  }

  toggleDose(index: number): void {
    this.doseSelection[index] = !this.doseSelection[index];
    this.updateFrequency();
  }

  updateFrequency(): void {
    const frequency = this.doseSelection.map(selected => selected ? '1' : '0').join('-');
    this.medicineForm.patchValue({ frequency });
  }

  onSubmit(): void {
    if (this.medicineForm.invalid) {
      this.medicineForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.medicineForm.value;
    const scheduledTimes = this.scheduledTimesArray.value.filter((t: string) => t && t.trim() !== '');

    const medicine: CreateMedicineDto = {
      ...formValue,
      originalDurationDays: formValue.durationDays,
      originalTotalPills: formValue.totalPills,
      scheduledTimes,
      startDate: new Date(formValue.startDate)
    };

    this.medicineService.createMedicine(medicine).subscribe({
      next: () => {
        this.router.navigate(['/medications']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to add medicine. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
