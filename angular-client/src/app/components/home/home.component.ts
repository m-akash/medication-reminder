import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8 gap-4">
        <div>
          @if (getCurrentUser()) {
            <h1 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
              Welcome back, {{ getWelcomeName() }}! 👋
            </h1>
            <p class="text-gray-600 font-semibold mt-2">Here's your medicine overview for today</p>
          } @else {
            <h1 class="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
              Welcome to Medicine Reminder! 💊
            </h1>
            <p class="text-gray-600 font-semibold mt-2">Simplify your schedule and track your health daily.</p>
          }
        </div>
        <div class="relative flex items-center gap-3">
          @if (getCurrentUser()) {
            <button (click)="toggleDropdown($event)" class="btn btn-ghost btn-circle avatar hover:bg-white/20 transition-all duration-200">
              <div class="w-11 h-11 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 flex items-center justify-center shadow-lg border border-white/50">
                <span class="text-white font-extrabold text-lg">{{ getInitials() }}</span>
              </div>
            </button>
            
            <ul *ngIf="isDropdownOpen" (click)="$event.stopPropagation()" class="absolute right-0 mt-3 z-[10] p-2 shadow-2xl bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl w-56 space-y-1">
              <li class="px-4 py-2 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Account</li>
              <li><a class="flex items-center gap-3 py-2.5 px-4 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-gray-700" routerLink="/settings" (click)="closeDropdown()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                </svg>
                <span>Settings</span>
              </a></li>
              <li><a class="flex items-center gap-3 py-2.5 px-4 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600 hover:text-white rounded-xl transition-all duration-200 font-bold text-gray-700 cursor-pointer" (click)="logout(); closeDropdown()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Logout</span>
              </a></li>
            </ul>
          } @else {
            <a routerLink="/login" class="btn btn-sm btn-outline btn-primary rounded-xl font-bold px-4 transition-all duration-200">
              Login
            </a>
            <a routerLink="/register" class="btn btn-sm bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white border-0 hover:opacity-95 font-bold rounded-xl shadow-md transition-all duration-200 px-4">
              Register
            </a>
          }
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Card 1 -->
        <div class="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group">
          <div class="absolute top-0 left-0 h-full w-2 bg-emerald-500"></div>
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Total Medicines</span>
            <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight">{{ medicines.length }}</h3>
            <p class="text-xs font-medium text-gray-500">Active medications listed</p>
          </div>
          <div class="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group">
          <div class="absolute top-0 left-0 h-full w-2 bg-amber-500"></div>
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Due Today</span>
            <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight">{{ getDueTodayCount() }}</h3>
            <p class="text-xs font-medium text-gray-500">Scheduled doses for today</p>
          </div>
          <div class="p-3 bg-amber-100/50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6 flex items-center justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group">
          <div class="absolute top-0 left-0 h-full w-2 bg-indigo-500"></div>
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Refill Alerts</span>
            <h3 class="text-3xl font-extrabold text-gray-800 tracking-tight">{{ refillReminders.length }}</h3>
            <p class="text-xs font-medium text-gray-500">Needs your attention soon</p>
          </div>
          <div class="p-3 bg-indigo-100/50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <!-- Action 1: My Medicines -->
        <a routerLink="/medications" class="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer text-center">
          <div class="p-4 bg-indigo-50 text-indigo-500 rounded-2xl mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <span class="font-bold text-gray-800 text-sm tracking-tight">My Medicines</span>
          <span class="text-xs text-gray-500 mt-1">View list & track</span>
        </a>

        <!-- Action 2: Add Medicine -->
        <a routerLink="/add-medicine" class="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-400 to-indigo-500 shadow-xl rounded-3xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer text-center text-white">
          <div class="p-4 bg-white/20 text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span class="font-extrabold text-white text-sm tracking-tight">Add Medicine</span>
          <span class="text-xs text-white/80 mt-1">New schedule entry</span>
        </a>

        <!-- Action 3: Reports -->
        <a routerLink="/reports" class="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer text-center">
          <div class="p-4 bg-emerald-50 text-emerald-500 rounded-2xl mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0H8.25m11.25 0v3.75m0-3.75h1.5M8.25 19.5v3.75m0-3.75H6.75" />
            </svg>
          </div>
          <span class="font-bold text-gray-800 text-sm tracking-tight">Reports</span>
          <span class="text-xs text-gray-500 mt-1">View adherence history</span>
        </a>

        <!-- Action 4: Settings -->
        <a routerLink="/settings" class="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer text-center">
          <div class="p-4 bg-amber-50 text-amber-500 rounded-2xl mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
            </svg>
          </div>
          <span class="font-bold text-gray-800 text-sm tracking-tight">Settings</span>
          <span class="text-xs text-gray-500 mt-1">Preferences & profile</span>
        </a>
      </div>

      <!-- Guest Welcome Banner -->
      <div class="bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mt-6" *ngIf="!getCurrentUser()">
        <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div class="relative z-[1] max-w-xl space-y-4">
          <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">Never Miss a Dose Again! 🗓️</h2>
          <p class="text-white/95 text-base md:text-lg font-medium leading-relaxed">
            Create an account to build your personalized medicine schedule, track daily taken statuses, receive refill reminders, and view adherence reports over time.
          </p>
          <div class="flex flex-wrap gap-4 pt-2">
            <a routerLink="/register" class="btn bg-white text-indigo-600 hover:bg-white/90 border-0 font-extrabold rounded-2xl px-6 py-3 shadow-lg transition-transform hover:scale-105 duration-200">
              Get Started for Free
            </a>
            <a routerLink="/login" class="btn btn-outline border-white text-white hover:bg-white/10 rounded-2xl px-6 py-3 font-bold transition-transform hover:scale-105 duration-200">
              Sign In
            </a>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6 md:p-8 mb-6" *ngIf="getTodaySchedule().length > 0">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
            <span class="text-indigo-500">📅</span> Today's Schedule
          </h2>
          <span class="badge badge-primary font-bold py-3 px-4 rounded-xl">{{ getTodaySchedule().length }} doses scheduled</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (item of getTodaySchedule(); track $index) {
            <div class="flex items-center justify-between p-4 bg-white/50 border border-gray-100 hover:border-indigo-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl w-12 h-12 flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform duration-300">
                    {{ item.medicine.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-base tracking-tight">{{ item.medicine.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="badge badge-sm badge-outline text-gray-500 border-gray-200">{{ item.medicine.dosage || 'As prescribed' }}</span>
                    <span class="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {{ item.time }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <label class="cursor-pointer p-2 hover:bg-emerald-50 rounded-xl transition-all duration-200" title="Toggle Taken">
                  <input type="checkbox" class="checkbox checkbox-success checkbox-md rounded-lg transition-transform duration-200 active:scale-95" [checked]="item.taken" (change)="toggleDoseTaken(item.medicine, item.timeIndex, $event)" />
                </label>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Refill Reminders -->
      <div class="bg-white/70 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl p-6 md:p-8 mt-6" *ngIf="refillReminders.length > 0">
        <h2 class="text-2xl font-extrabold text-gray-800 tracking-tight mb-6 flex items-center gap-2">
          <span class="text-rose-500">⚠️</span> Refill Reminders
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (reminder of refillReminders; track reminder.id) {
            <div class="flex items-center justify-between p-5 bg-gradient-to-r from-rose-50/55 to-amber-50/55 border border-rose-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div class="space-y-1">
                <h3 class="font-bold text-gray-800 text-base tracking-tight">{{ reminder.name }}</h3>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {{ reminder.pillsLeft }} pills left
                  </span>
                  <span class="text-xs font-semibold text-gray-400">•</span>
                  <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    {{ reminder.daysLeft }} days remaining
                  </span>
                </div>
              </div>
              <button (click)="refillMedicine(reminder.id)" class="btn btn-sm btn-outline btn-error hover:bg-rose-600 hover:text-white rounded-xl font-bold px-4 transition-all duration-200">
                Refill
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  medicines: Medicine[] = [];
  refillReminders: any[] = [];
  userEmail = '';
  todayTakenMap: { [medicineId: string]: string } = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.userEmail = user.email;
    this.loadData();
  }

  loadData(): void {
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.loadTodayTakenStatus();
      },
      error: (err) => {
        console.error('Error loading medicines:', err);
      }
    });

    this.medicineService.getRefillReminders().subscribe({
      next: (reminders) => {
        this.refillReminders = reminders;
      },
      error: (err) => {
        console.error('Error loading refill reminders:', err);
      }
    });
  }

  loadTodayTakenStatus(): void {
    const today = new Date().toISOString().split('T')[0];
    this.medicines.forEach(med => {
      this.medicineService.getMedicineTakenDay(med.id, today).subscribe({
        next: (takenDay) => {
          if (takenDay) {
            this.todayTakenMap[med.id] = takenDay.taken || '0-0-0';
          } else {
            this.todayTakenMap[med.id] = '0-0-0';
          }
        },
        error: () => {
          this.todayTakenMap[med.id] = '0-0-0';
        }
      });
    });
  }

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getWelcomeName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'User';
    if (user.name) {
      if (user.name.includes('@')) {
        const parts = user.name.split('@');
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
      return user.name;
    }
    if (user.email) {
      const parts = user.email.split('@');
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return 'User';
  }

  getInitials(): string {
    const name = this.getWelcomeName();
    return name.charAt(0).toUpperCase();
  }

  getDueTodayCount(): number {
    return this.medicines.reduce((total, med) => {
      const doses = med.frequency.split('-').map((d: string) => parseInt(d) || 0);
      return total + doses.reduce((a: number, b: number) => a + b, 0);
    }, 0);
  }

  getTodaySchedule(): any[] {
    const schedule: any[] = [];
    const times = ['Morning', 'Afternoon', 'Evening'];

    this.medicines.forEach(med => {
      const doses = med.frequency.split('-');
      const takenDoses = (this.todayTakenMap[med.id] || '0-0-0').split('-');
      doses.forEach((dose, index) => {
        if (dose === '1' && times[index]) {
          schedule.push({
            medicine: med,
            time: times[index],
            taken: takenDoses[index] === '1',
            timeIndex: index
          });
        }
      });
    });

    return schedule;
  }

  toggleDoseTaken(medicine: Medicine, timeIndex: number, event: any): void {
    const today = new Date().toISOString().split('T')[0];
    const isChecked = event.target.checked;
    
    const currentTaken = this.todayTakenMap[medicine.id] || '0-0-0';
    const takenArray = currentTaken.split('-').map(t => parseInt(t) || 0);
    
    takenArray[timeIndex] = isChecked ? 1 : 0;
    const newTakenStr = takenArray.join('-');
    
    this.medicineService.setMedicineTakenDay(medicine.id, { date: today, taken: newTakenStr }).subscribe({
      next: () => {
        this.todayTakenMap[medicine.id] = newTakenStr;
        this.loadData();
      },
      error: (err) => {
        console.error('Error toggling dose:', err);
        event.target.checked = !isChecked;
      }
    });
  }

  refillMedicine(id: string): void {
    this.medicineService.refillMedicine(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        console.error('Error refilling medicine:', err);
      }
    });
  }

  isDropdownOpen = false;

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/home';
  }
}
