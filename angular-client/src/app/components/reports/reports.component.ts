import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';
import { MedicineTakenDay } from '../../models/medicine.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/medications" class="btn btn-circle btn-ghost hover:bg-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-6 w-6 text-gray-700">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 tracking-tight">
            Medicine Reports
          </h1>
          <p class="text-gray-600 font-semibold mt-1">Track your medicine adherence over time</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="flex justify-center items-center h-64">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      }

      <!-- Report Content -->
      @if (!isLoading) {
        <div class="card bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl p-6 md:p-8 space-y-8">
          <!-- Medicine Info -->
          <div class="pb-6 border-b border-gray-150">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Medication Report</span>
            <h2 class="text-3xl font-extrabold text-gray-800 tracking-tight mt-1">{{ medicineName }}</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <!-- Stat 1 -->
              <div class="p-4 bg-white/50 border border-gray-100 rounded-2xl shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Days</p>
                <p class="text-2xl font-black text-indigo-600 mt-1">{{ totalDays }} days</p>
              </div>
              <!-- Stat 2 -->
              <div class="p-4 bg-white/50 border border-gray-100 rounded-2xl shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Days Tracked</p>
                <p class="text-2xl font-black text-emerald-600 mt-1">{{ history.length }} days</p>
              </div>
              <!-- Stat 3 -->
              <div class="p-4 bg-white/50 border border-gray-100 rounded-2xl shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Doses Taken</p>
                <p class="text-2xl font-black text-amber-600 mt-1">{{ totalDosesTaken }}</p>
              </div>
              <!-- Stat 4 -->
              <div class="p-4 bg-white/50 border border-gray-100 rounded-2xl shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Adherence</p>
                <p class="text-2xl font-black mt-1" [class.text-emerald-600]="adherenceRate >= 80" [class.text-amber-600]="adherenceRate < 80 && adherenceRate >= 50" [class.text-red-600]="adherenceRate < 50">
                  {{ adherenceRate }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Calendar View -->
          <div>
            <h3 class="text-xl font-extrabold text-gray-800 mb-4 tracking-tight flex items-center gap-2">
              <span>📊</span> Daily History Log
            </h3>

            @if (history.length === 0) {
              <div class="text-center py-12 bg-white/40 border border-dashed border-gray-200 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-16 w-16 mx-auto text-gray-300 mb-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V5.625c0-.621.504-1.125 1.125-1.125h3.375c.621 0 1.125.504 1.125 1.125V6.11" />
                </svg>
                <p class="text-gray-500 font-semibold">No history data available for this medicine</p>
              </div>
            } @else {
              <div class="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table class="table w-full bg-white/40">
                  <thead>
                    <tr class="bg-gradient-to-r from-emerald-50/50 to-indigo-50/50 text-gray-600 font-bold border-b border-gray-150">
                      <th class="py-4 px-6 text-left">Date</th>
                      <th class="py-4 px-6 text-left">Doses Taken</th>
                      <th class="py-4 px-6 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (item of history; track item.id) {
                      <tr class="hover:bg-white/30 transition-colors">
                        <td class="py-4 px-6 font-semibold text-gray-800">{{ formatDate(item.date) }}</td>
                        <td class="py-4 px-6">
                          <div class="flex flex-wrap gap-2">
                            @for (dose of getDoseBreakdown(item.taken); track $index) {
                              <span class="badge font-bold text-xs py-2 px-3 rounded-lg border-0 shadow-sm" 
                                    [class.bg-emerald-100]="dose === '1'" 
                                    [class.text-emerald-700]="dose === '1'"
                                    [class.bg-rose-100]="dose === '0'"
                                    [class.text-rose-700]="dose === '0'">
                                {{ getDoseTimeName($index) }}: {{ dose === '1' ? 'Taken' : 'Missed' }}
                              </span>
                            }
                          </div>
                        </td>
                        <td class="py-4 px-6">
                          @if (getCompletionPercentage(item.taken) === 100) {
                            <span class="badge bg-emerald-500 text-white font-bold px-3 py-2 border-0 rounded-lg text-xs shadow-sm">Complete</span>
                          } @else if (getCompletionPercentage(item.taken) >= 50) {
                            <span class="badge bg-amber-400 text-white font-bold px-3 py-2 border-0 rounded-lg text-xs shadow-sm">Partial</span>
                          } @else {
                            <span class="badge bg-rose-500 text-white font-bold px-3 py-2 border-0 rounded-lg text-xs shadow-sm">Missed</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Summary Stats -->
          @if (history.length > 0) {
            <div class="pt-6 border-t border-gray-150">
              <h3 class="text-lg font-bold text-gray-800 mb-4 tracking-tight">Summary Stats</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="relative overflow-hidden bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                  <div class="absolute top-0 left-0 h-full w-1.5 bg-emerald-500"></div>
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Completed</span>
                  <span class="text-3xl font-black text-emerald-600 mt-1">{{ getCompletedDays() }} days</span>
                </div>
                <div class="relative overflow-hidden bg-amber-50/40 border border-amber-100 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                  <div class="absolute top-0 left-0 h-full w-1.5 bg-amber-400"></div>
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Partially Completed</span>
                  <span class="text-3xl font-black text-amber-500 mt-1">{{ getPartialDays() }} days</span>
                </div>
                <div class="relative overflow-hidden bg-rose-50/40 border border-rose-100 rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
                  <div class="absolute top-0 left-0 h-full w-1.5 bg-rose-500"></div>
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Missed</span>
                  <span class="text-3xl font-black text-rose-600 mt-1">{{ getMissedDays() }} days</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReportsComponent implements OnInit {
  medicineId = '';
  medicineName = '';
  history: MedicineTakenDay[] = [];
  isLoading = false;
  totalDays = 30;
  totalDosesTaken = 0;
  adherenceRate = 0;
  userEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicineService: MedicineService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.userEmail = user.email;
    this.medicineId = this.route.snapshot.paramMap.get('id') || '';

    if (this.medicineId) {
      this.loadMedicineHistory();
    } else {
      // No medicine ID, show all medicines summary
      this.router.navigate(['/medications']);
    }
  }

  loadMedicineHistory(): void {
    this.isLoading = true;

    // Get medicine details first
    this.medicineService.getMedicineById(this.medicineId).subscribe({
      next: (medicine) => {
        this.medicineName = medicine.name;
        this.totalDays = medicine.durationDays;

        // Get history for the last 30 days
        const from = new Date();
        from.setDate(from.getDate() - this.totalDays);
        const to = new Date();

        this.medicineService.getMedicineTakenHistory(
          this.medicineId,
          from.toISOString().split('T')[0],
          to.toISOString().split('T')[0]
        ).subscribe({
          next: (history) => {
            this.history = history;
            this.calculateStats();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading history:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading medicine:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    let totalTaken = 0;
    let totalScheduled = 0;

    this.history.forEach(item => {
      if (item.taken) {
        const doses = item.taken.split('-');
        totalTaken += doses.filter(d => d === '1').length;
        totalScheduled += doses.length;
      }
    });

    this.totalDosesTaken = totalTaken;
    this.adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getDoseBreakdown(takenStr: string | undefined): string[] {
    if (!takenStr) return ['0', '0', '0'];
    return takenStr.split('-');
  }

  getDoseTimeName(index: number): string {
    const times = ['Morning', 'Afternoon', 'Evening'];
    return times[index] || `Dose ${index + 1}`;
  }

  getCompletionPercentage(takenStr: string | undefined): number {
    if (!takenStr) return 0;
    const doses = takenStr.split('-');
    const taken = doses.filter(d => d === '1').length;
    return doses.length > 0 ? Math.round((taken / doses.length) * 100) : 0;
  }

  getCompletedDays(): number {
    return this.history.filter(item => this.getCompletionPercentage(item.taken) === 100).length;
  }

  getPartialDays(): number {
    return this.history.filter(item => {
      const pct = this.getCompletionPercentage(item.taken);
      return pct > 0 && pct < 100;
    }).length;
  }

  getMissedDays(): number {
    return this.history.filter(item => this.getCompletionPercentage(item.taken) === 0).length;
  }
}
