import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserSettings, UpdateUserSettingsDto } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/home" class="btn btn-circle btn-ghost hover:bg-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-6 w-6 text-gray-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
            Settings
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Customize your medicine reminder preferences</p>
        </div>
      </div>

      <!-- Settings Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Notifications -->
        <div class="lg:col-span-2">
          <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            <div class="card-body p-8 space-y-8">
              <!-- Notification Settings -->
              <div>
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6 text-indigo-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  Notification Settings
                </h2>

                <div class="space-y-4">
                  <!-- Enable Notifications -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <span class="label-text font-bold text-gray-700">Enable Notifications</span>
                      <input type="checkbox" formControlName="notifications_enabled" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>

                  <!-- Reminder Advance -->
                  <div class="form-control bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <label class="label p-0 flex flex-col items-start gap-1">
                      <span class="label-text font-bold text-gray-700">Reminder Advance Time</span>
                      <span class="label-text-alt text-gray-400">Minutes before scheduled dose time</span>
                    </label>
                    <input
                      type="number"
                      formControlName="notifications_reminderAdvance"
                      class="input input-bordered w-full max-w-xs rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all mt-1"
                      min="0"
                      max="60"
                    />
                  </div>

                  <!-- Missed Dose Alerts -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div class="flex flex-col">
                        <span class="label-text font-bold text-gray-700">Missed Dose Alerts</span>
                        <span class="label-text-alt text-gray-400 mt-0.5">Get notified when you miss a dose</span>
                      </div>
                      <input type="checkbox" formControlName="notifications_missedDoseAlerts" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>

                  <!-- Refill Reminders -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div class="flex flex-col">
                        <span class="label-text font-bold text-gray-700">Refill Reminders</span>
                        <span class="label-text-alt text-gray-400 mt-0.5">Get reminded to refill your medicines</span>
                      </div>
                      <input type="checkbox" formControlName="notifications_refillReminders" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>

                  <!-- Daily Summary -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div class="flex flex-col">
                        <span class="label-text font-bold text-gray-700">Daily Summary</span>
                        <span class="label-text-alt text-gray-400 mt-0.5">Receive a daily summary of your medications</span>
                      </div>
                      <input type="checkbox" formControlName="notifications_dailySummary" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Medicine Defaults -->
              <div class="border-t border-gray-150 pt-8">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6 text-emerald-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Default Medicine Settings
                </h2>

                <div class="space-y-4">
                  <!-- Default Doses Per Day -->
                  <div class="form-control bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <label class="label p-0">
                      <span class="label-text font-bold text-gray-700">Default Doses Per Day</span>
                    </label>
                    <input
                      type="number"
                      formControlName="medicineDefaults_defaultDosesPerDay"
                      class="input input-bordered w-full max-w-xs rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all mt-1"
                      min="1"
                      max="3"
                    />
                  </div>

                  <!-- Default Reminder Times -->
                  <div class="form-control bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <label class="label p-0 flex flex-col items-start gap-1">
                      <span class="label-text font-bold text-gray-700">Default Reminder Times</span>
                      <span class="label-text-alt text-gray-400">Comma-separated times in HH:MM format</span>
                    </label>
                    <input
                      type="text"
                      formControlName="medicineDefaults_defaultReminderTimes"
                      class="input input-bordered w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all mt-1"
                      placeholder="08:00, 14:00, 20:00"
                    />
                    <label class="label p-0">
                      <span class="label-text-alt text-xs text-gray-400">Example: 08:00, 14:00, 20:00 for 8 AM, 2 PM, 8 PM</span>
                    </label>
                  </div>

                  <!-- Default Duration Days -->
                  <div class="form-control bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <label class="label p-0">
                      <span class="label-text font-bold text-gray-700">Default Duration (Days)</span>
                    </label>
                    <input
                      type="number"
                      formControlName="medicineDefaults_defaultDurationDays"
                      class="input input-bordered w-full max-w-xs rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all mt-1"
                      min="0"
                      placeholder="0 for ongoing"
                    />
                    <label class="label p-0">
                      <span class="label-text-alt text-xs text-gray-400">Enter 0 for ongoing medications</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Privacy Settings -->
              <div class="border-t border-gray-150 pt-8">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6 text-amber-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Privacy Settings
                </h2>

                <div class="space-y-4">
                  <!-- Data Sharing -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div class="flex flex-col">
                        <span class="label-text font-bold text-gray-700">Data Sharing</span>
                        <span class="label-text-alt text-gray-400 mt-0.5">Allow anonymous data sharing for research</span>
                      </div>
                      <input type="checkbox" formControlName="privacy_dataSharing" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>

                  <!-- Analytics -->
                  <div class="form-control">
                    <label class="label cursor-pointer flex justify-between items-center bg-white/40 border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div class="flex flex-col">
                        <span class="label-text font-bold text-gray-700">Analytics</span>
                        <span class="label-text-alt text-gray-400 mt-0.5">Help improve the app with usage analytics</span>
                      </div>
                      <input type="checkbox" formControlName="privacy_analytics" class="toggle toggle-primary toggle-md" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="card-actions justify-end pt-6 border-t border-gray-150">
                <button
                  type="submit"
                  class="btn bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white border-0 hover:opacity-95 font-bold px-8 rounded-2xl shadow-lg transition-opacity"
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
                <div class="alert alert-success mt-4 rounded-xl shadow-md flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-bold text-sm">{{ successMessage }}</span>
                </div>
              }

              @if (errorMessage) {
                <div class="alert alert-error mt-4 rounded-xl shadow-md flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="font-bold text-sm">{{ errorMessage }}</span>
                </div>
              }
            </div>
          </form>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-6">
          <!-- Account Card -->
          <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl overflow-hidden">
            <div class="card-body p-6">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 text-indigo-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Account Information
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center bg-white/30 p-3 rounded-xl border border-white/20">
                  <span class="text-gray-500 text-sm font-semibold">Name</span>
                  <span class="font-bold text-gray-800 text-sm">{{ getCurrentUserName() }}</span>
                </div>
                <div class="flex justify-between items-center bg-white/30 p-3 rounded-xl border border-white/20">
                  <span class="text-gray-500 text-sm font-semibold">Email</span>
                  <span class="font-bold text-gray-800 text-xs">{{ getCurrentUserEmail() }}</span>
                </div>
                <button (click)="logout()" class="btn btn-sm btn-error btn-outline hover:bg-red-500 hover:text-white rounded-xl w-full mt-4 font-bold transition-all py-2 h-auto">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- App Info Card -->
          <div class="card bg-gradient-to-br from-amber-50/50 to-indigo-50/50 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl overflow-hidden">
            <div class="card-body p-6 text-center">
              <h3 class="font-extrabold text-gray-800 text-lg">Medicine Reminder</h3>
              <p class="text-xs font-semibold text-gray-400 mt-1">Version 1.0.0</p>
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
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/settings' } });
      return;
    }

    this.loadSettings();
  }

  loadSettings(): void {
    this.userService.getCurrentUserSettings().subscribe({
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

    this.userService.saveCurrentUserSettings(settings).subscribe({
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
    window.location.href = '/home';
  }
}
