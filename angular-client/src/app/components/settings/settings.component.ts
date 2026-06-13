import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserSettings, UpdateUserSettingsDto } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/home" class="btn btn-circle btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
            Settings
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Customize your medicine reminder preferences</p>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Notifications -->
        <div class="lg:col-span-2">
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="card bg-white shadow-xl rounded-2xl">
            <div class="card-body p-8 space-y-8">
              <!-- Notification Settings -->
              <div>
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 text-indigo-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4h.341C7.67 6.165 6 8.388 6 10v4a6.002 6.002 0 004 5.659V11a6.002 6.002 0 004 5.659V12a2 2 0 102 0v-4a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4h.341C12.33 6.165 14 8.388 14 10v4a6.002 6.002 0 004 5.659V12a2 2 0 102 0v-4a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4h.341" />
                  </svg>
                  Notification Settings
                </h2>

                <div class="space-y-4">
                  <!-- Enable Notifications -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Enable Notifications</span>
                      <input type="checkbox" formControlName="notifications_enabled" class="toggle toggle-primary" />
                    </label>
                  </div>

                  <!-- Reminder Advance -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-bold text-gray-700">Reminder Advance Time</span>
                      <span class="label-text-alt">Minutes before dose time</span>
                    </label>
                    <input
                      type="number"
                      formControlName="notifications_reminderAdvance"
                      class="input input-bordered w-full max-w-xs"
                      min="0"
                      max="60"
                    />
                  </div>

                  <!-- Missed Dose Alerts -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Missed Dose Alerts</span>
                      <input type="checkbox" formControlName="notifications_missedDoseAlerts" class="toggle toggle-primary" />
                    </label>
                    <span class="label-text-alt">Get notified when you miss a dose</span>
                  </div>

                  <!-- Refill Reminders -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Refill Reminders</span>
                      <input type="checkbox" formControlName="notifications_refillReminders" class="toggle toggle-primary" />
                    </label>
                    <span class="label-text-alt">Get reminded to refill your medicines</span>
                  </div>

                  <!-- Daily Summary -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Daily Summary</span>
                      <input type="checkbox" formControlName="notifications_dailySummary" class="toggle toggle-primary" />
                    </label>
                    <span class="label-text-alt">Receive a daily summary of your medications</span>
                  </div>
                </div>
              </div>

              <!-- Medicine Defaults -->
              <div class="border-t border-gray-200 pt-8">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 text-emerald-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Default Medicine Settings
                </h2>

                <div class="space-y-4">
                  <!-- Default Doses Per Day -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-bold text-gray-700">Default Doses Per Day</span>
                    </label>
                    <input
                      type="number"
                      formControlName="medicineDefaults_defaultDosesPerDay"
                      class="input input-bordered w-full max-w-xs"
                      min="1"
                      max="3"
                    />
                  </div>

                  <!-- Default Reminder Times -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-bold text-gray-700">Default Reminder Times</span>
                      <span class="label-text-alt">Comma-separated times in HH:MM format</span>
                    </label>
                    <input
                      type="text"
                      formControlName="medicineDefaults_defaultReminderTimes"
                      class="input input-bordered w-full"
                      placeholder="08:00, 14:00, 20:00"
                    />
                    <label class="label">
                      <span class="label-text-alt text-xs">Example: 08:00, 14:00, 20:00 for 8 AM, 2 PM, 8 PM</span>
                    </label>
                  </div>

                  <!-- Default Duration Days -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-bold text-gray-700">Default Duration (Days)</span>
                    </label>
                    <input
                      type="number"
                      formControlName="medicineDefaults_defaultDurationDays"
                      class="input input-bordered w-full max-w-xs"
                      min="0"
                      placeholder="0 for ongoing"
                    />
                    <label class="label">
                      <span class="label-text-alt text-xs">Enter 0 for ongoing medications</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Privacy Settings -->
              <div class="border-t border-gray-200 pt-8">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 text-amber-500">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy Settings
                </h2>

                <div class="space-y-4">
                  <!-- Data Sharing -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Data Sharing</span>
                      <input type="checkbox" formControlName="privacy_dataSharing" class="toggle toggle-primary" />
                    </label>
                    <span class="label-text-alt">Allow anonymous data sharing for research</span>
                  </div>

                  <!-- Analytics -->
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text font-bold text-gray-700">Analytics</span>
                      <input type="checkbox" formControlName="privacy_analytics" class="toggle toggle-primary" />
                    </label>
                    <span class="label-text-alt">Help improve the app with usage analytics</span>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="card-actions justify-end pt-4">
                <button
                  type="submit"
                  class="btn btn-primary bg-gradient-to-r from-amber-400 to-indigo-400 text-white border-0 hover:opacity-90 font-bold px-8"
                  [disabled]="settingsForm.pristine || settingsForm.invalid || isLoading"
                >
                  @if (isLoading) {
                    <span class="loading loading-spinner"></span>
                  } @else {
                    Save Settings
                  }
                </button>
              </div>

              <!-- Success/Error Messages -->
              @if (successMessage) {
                <div class="alert alert-success mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ successMessage }}</span>
                </div>
              }

              @if (errorMessage) {
                <div class="alert alert-error mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>
              }
            </div>
          </form>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-6">
          <!-- Account Card -->
          <div class="card bg-white shadow-xl rounded-2xl">
            <div class="card-body">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-5 w-5 text-indigo-500">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Name</span>
                  <span class="font-semibold text-gray-800">{{ getCurrentUserName() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Email</span>
                  <span class="font-semibold text-gray-800 text-sm">{{ getCurrentUserEmail() }}</span>
                </div>
                <button (click)="logout()" class="btn btn-sm btn-error btn-outline w-full mt-4">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- App Info Card -->
          <div class="card bg-gradient-to-br from-amber-50 to-indigo-50 shadow-xl rounded-2xl">
            <div class="card-body">
              <h3 class="font-bold text-gray-800 mb-2">Medicine Reminder</h3>
              <p class="text-sm text-gray-600">Version 1.0.0</p>
              <p class="text-sm text-gray-600 mt-2">Built with ABP Framework & Angular</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.settingsForm = this.fb.group({
      // Notification settings
      notifications_enabled: [true],
      notifications_reminderAdvance: [30],
      notifications_missedDoseAlerts: [true],
      notifications_refillReminders: [true],
      notifications_dailySummary: [false],
      // Medicine defaults
      medicineDefaults_defaultDosesPerDay: [1],
      medicineDefaults_defaultReminderTimes: ['08:00, 14:00, 20:00'],
      medicineDefaults_defaultDurationDays: [0],
      // Privacy settings
      privacy_dataSharing: [false],
      privacy_analytics: [true]
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userEmail = user.email;
    this.loadSettings();
  }

  loadSettings(): void {
    this.userService.getUserSettings(this.userEmail).subscribe({
      next: (settings) => {
        this.settingsForm.patchValue({
          notifications_enabled: settings.notifications.enabled,
          notifications_reminderAdvance: settings.notifications.reminderAdvance,
          notifications_missedDoseAlerts: settings.notifications.missedDoseAlerts,
          notifications_refillReminders: settings.notifications.refillReminders,
          notifications_dailySummary: settings.notifications.dailySummary,
          medicineDefaults_defaultDosesPerDay: settings.medicineDefaults.defaultDosesPerDay,
          medicineDefaults_defaultReminderTimes: settings.medicineDefaults.defaultReminderTimes.join(', '),
          medicineDefaults_defaultDurationDays: settings.medicineDefaults.defaultDurationDays,
          privacy_dataSharing: settings.privacy.dataSharing,
          privacy_analytics: settings.privacy.analytics
        });
      },
      error: (err) => {
        console.error('Error loading settings:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.settingsForm.value;

    const settings: UpdateUserSettingsDto = {
      notifications: {
        enabled: formValue.notifications_enabled,
        reminderAdvance: formValue.notifications_reminderAdvance,
        missedDoseAlerts: formValue.notifications_missedDoseAlerts,
        refillReminders: formValue.notifications_refillReminders,
        dailySummary: formValue.notifications_dailySummary
      },
      medicineDefaults: {
        defaultDosesPerDay: formValue.medicineDefaults_defaultDosesPerDay,
        defaultReminderTimes: formValue.medicineDefaults_defaultReminderTimes.split(',').map((time: string) => time.trim()),
        defaultDurationDays: formValue.medicineDefaults_defaultDurationDays
      },
      privacy: {
        dataSharing: formValue.privacy_dataSharing,
        analytics: formValue.privacy_analytics
      }
    };

    this.userService.saveUserSettings(this.userEmail, settings).subscribe({
      next: () => {
        this.successMessage = 'Settings saved successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to save settings. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || '';
  }

  getCurrentUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
