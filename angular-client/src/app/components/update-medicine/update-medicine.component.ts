import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { Medicine, UpdateMedicineDto } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-update-medicine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/medications" class="btn btn-circle btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
            Update Medicine
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Edit medication details and schedule</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoadingMedicine) {
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }

      <!-- Form Card -->
      @if (!isLoadingMedicine) {
        <div class="card bg-white shadow-2xl rounded-2xl max-w-2xl mx-auto">
          <form [formGroup]="medicineForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
            <!-- Medicine Name -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Medicine Name *</span>
              </label>
              <input
                type="text"
                formControlName="name"
                class="input input-bordered w-full"
                placeholder="e.g., Aspirin, Metformin, etc."
                [class.input-error]="medicineForm.get('name')?.touched && medicineForm.get('name')?.invalid"
              />
              @if (medicineForm.get('name')?.touched && medicineForm.get('name')?.invalid) {
                <span class="text-error text-sm">Medicine name is required</span>
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
                class="input input-bordered w-full"
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
                class="textarea textarea-bordered w-full"
                placeholder="e.g., Take after meals, etc."
                rows="2"
              ></textarea>
            </div>

            <!-- Frequency -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Frequency (Morning-Afternoon-Evening) *</span>
                <span class="label-text-alt">Select when to take each dose</span>
              </label>
              <div class="grid grid-cols-3 gap-4">
                <label class="label cursor-pointer border-2 rounded-xl p-4 transition-colors"
                       [class.border-primary]="isDoseSelected(0)"
                       [class.border-gray-200]="!isDoseSelected(0)">
                  <input type="checkbox" class="checkbox checkbox-primary" (change)="toggleDose(0)" />
                  <span class="label-text font-bold text-center block">Morning</span>
                </label>
                <label class="label cursor-pointer border-2 rounded-xl p-4 transition-colors"
                       [class.border-primary]="isDoseSelected(1)"
                       [class.border-gray-200]="!isDoseSelected(1)">
                  <input type="checkbox" class="checkbox checkbox-primary" (change)="toggleDose(1)" />
                  <span class="label-text font-bold text-center block">Afternoon</span>
                </label>
                <label class="label cursor-pointer border-2 rounded-xl p-4 transition-colors"
                       [class.border-primary]="isDoseSelected(2)"
                       [class.border-gray-200]="!isDoseSelected(2)">
                  <input type="checkbox" class="checkbox checkbox-primary" (change)="toggleDose(2)" />
                  <span class="label-text font-bold text-center block">Evening</span>
                </label>
              </div>
              @if (medicineForm.get('frequency')?.invalid && medicineForm.get('frequency')?.touched) {
                <span class="text-error text-sm">Please select at least one dose time</span>
              }
            </div>

            <!-- Reminder Times -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-bold text-gray-700">Reminder Times</span>
                <span class="label-text-alt">Set specific times for reminders (optional)</span>
              </label>
              <div formArrayName="scheduledTimes" class="space-y-2">
                @for (control of scheduledTimesArray.controls; track $index) {
                  <div class="flex gap-2">
                    <input
                      type="time"
                      [formControlName]="$index"
                      class="input input-bordered flex-1"
                    />
                    <button type="button" (click)="removeScheduledTime($index)" class="btn btn-sm btn-error" *ngIf="scheduledTimesArray.length > 1">
                      ✕
                    </button>
                  </div>
                }
              </div>
              <button type="button" (click)="addScheduledTime()" class="btn btn-sm btn-outline mt-2">
                + Add Time
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
                  class="input input-bordered w-full"
                  placeholder="e.g., 30"
                  min="1"
                  [class.input-error]="medicineForm.get('durationDays')?.touched && medicineForm.get('durationDays')?.invalid"
                />
                @if (medicineForm.get('durationDays')?.touched && medicineForm.get('durationDays')?.invalid) {
                  <span class="text-error text-sm">Duration is required</span>
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
                  class="input input-bordered w-full"
                  placeholder="e.g., 30"
                  min="1"
                  [class.input-error]="medicineForm.get('totalPills')?.touched && medicineForm.get('totalPills')?.invalid"
                />
                @if (medicineForm.get('totalPills')?.touched && medicineForm.get('totalPills')?.invalid) {
                  <span class="text-error text-sm">Total pills is required</span>
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
                  class="input input-bordered w-full"
                  placeholder="e.g., 1"
                  min="1"
                  [class.input-error]="medicineForm.get('pillsPerDose')?.touched && medicineForm.get('pillsPerDose')?.invalid"
                />
                @if (medicineForm.get('pillsPerDose')?.touched && medicineForm.get('pillsPerDose')?.invalid) {
                  <span class="text-error text-sm">Required</span>
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
                  class="input input-bordered w-full"
                  placeholder="e.g., 2"
                  min="1"
                  [class.input-error]="medicineForm.get('dosesPerDay')?.touched && medicineForm.get('dosesPerDay')?.invalid"
                />
                @if (medicineForm.get('dosesPerDay')?.touched && medicineForm.get('dosesPerDay')?.invalid) {
                  <span class="text-error text-sm">Required</span>
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
                class="input input-bordered w-full"
                [class.input-error]="medicineForm.get('startDate')?.touched && medicineForm.get('startDate')?.invalid"
              />
              @if (medicineForm.get('startDate')?.touched && medicineForm.get('startDate')?.invalid) {
                <span class="text-error text-sm">Start date is required</span>
              }
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
            }

            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-4">
              <button
                type="button"
                routerLink="/medications"
                class="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary flex-1 bg-gradient-to-r from-amber-400 to-indigo-400 text-white border-0 hover:opacity-90 font-bold"
                [disabled]="medicineForm.invalid || isLoading"
              >
                @if (isLoading) {
                  <span class="loading loading-spinner"></span>
                } @else {
                  Update Medicine
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class UpdateMedicineComponent implements OnInit {
  medicineForm: FormGroup;
  scheduledTimesArray: FormArray;
  errorMessage = '';
  isLoading = false;
  isLoadingMedicine = false;
  doseSelection = [false, false, false]; // Morning, Afternoon, Evening
  medicineId = '';
  currentUser: User | null = null;
  originalMedicine: Medicine | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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
      this.router.navigate(['/login']);
      return;
    }

    this.medicineId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.medicineId) {
      this.router.navigate(['/medications']);
      return;
    }

    this.loadMedicine();
  }

  loadMedicine(): void {
    this.isLoadingMedicine = true;

    this.medicineService.getMedicineById(this.medicineId).subscribe({
      next: (medicine) => {
        this.originalMedicine = medicine;
        this.populateForm(medicine);
        this.isLoadingMedicine = false;
      },
      error: (err) => {
        console.error('Error loading medicine:', err);
        this.errorMessage = 'Failed to load medicine details.';
        this.isLoadingMedicine = false;
      }
    });
  }

  populateForm(medicine: Medicine): void {
    // Parse frequency to set dose selection
    const doses = medicine.frequency.split('-');
    this.doseSelection = doses.map(d => d === '1');

    // Clear scheduled times and add medicine's times
    while (this.scheduledTimesArray.length > 0) {
      this.scheduledTimesArray.removeAt(0);
    }

    if (medicine.scheduledTime && medicine.scheduledTime.length > 0) {
      const times = typeof medicine.scheduledTime === 'string'
        ? medicine.scheduledTime.split(',')
        : medicine.scheduledTime;

      times.forEach((time: string) => {
        this.scheduledTimesArray.push(this.fb.control(time.trim()));
      });
    } else {
      // Default times
      ['08:00', '14:00', '20:00'].forEach(time => {
        this.scheduledTimesArray.push(this.fb.control(time));
      });
    }

    // Format start date
    const startDate = typeof medicine.startDate === 'string'
      ? new Date(medicine.startDate).toISOString().split('T')[0]
      : new Date(medicine.startDate as any).toISOString().split('T')[0];

    this.medicineForm.patchValue({
      name: medicine.name,
      dosage: medicine.dosage || '',
      instructions: medicine.instructions || '',
      frequency: medicine.frequency,
      durationDays: medicine.durationDays,
      originalDurationDays: medicine.originalDurationDays || medicine.durationDays,
      totalPills: medicine.totalPills,
      originalTotalPills: medicine.originalTotalPills || medicine.totalPills,
      pillsPerDose: medicine.pillsPerDose,
      dosesPerDay: medicine.dosesPerDay,
      startDate: startDate,
      appUserId: medicine.appUserId
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

    const medicine: UpdateMedicineDto = {
      ...formValue,
      scheduledTimes,
      startDate: new Date(formValue.startDate)
    };

    this.medicineService.updateMedicine(this.medicineId, medicine).subscribe({
      next: () => {
        this.router.navigate(['/medications']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update medicine. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
