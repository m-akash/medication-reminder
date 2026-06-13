import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineTakenDay,
  SetMedicineTakenDayDto,
  RefillReminder,
  Reminder,
  ToggleReminderDto
} from '../models/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMedicinesByUserEmail(userEmail: string): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/api/medicine/user/${userEmail}`);
  }

  getMedicineById(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/api/medicine/${id}`);
  }

  createMedicine(medicine: CreateMedicineDto): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.apiUrl}/api/medicine`, medicine);
  }

  updateMedicine(id: string, medicine: UpdateMedicineDto): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/api/medicine/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/medicine/${id}`);
  }

  getMedicineTakenDay(id: string, date: string): Observable<MedicineTakenDay> {
    const params = new HttpParams().set('date', date);
    return this.http.get<MedicineTakenDay>(`${this.apiUrl}/api/medicine/${id}/taken`, { params });
  }

  setMedicineTakenDay(id: string, data: SetMedicineTakenDayDto): Observable<MedicineTakenDay> {
    return this.http.put<MedicineTakenDay>(`${this.apiUrl}/api/medicine/${id}/taken`, data);
  }

  getMedicineTakenHistory(id: string, from: string, to: string): Observable<MedicineTakenDay[]> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<MedicineTakenDay[]>(`${this.apiUrl}/api/medicine/${id}/history`, { params });
  }

  getRefillReminders(userEmail: string): Observable<RefillReminder[]> {
    const params = new HttpParams().set('userEmail', userEmail);
    return this.http.get<RefillReminder[]>(`${this.apiUrl}/api/refill-reminders`, { params });
  }

  refillMedicine(id: string): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/api/medicine/${id}/refill`, {});
  }

  getReminderStatus(id: string): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.apiUrl}/api/medicine/${id}/reminder`);
  }

  toggleReminderStatus(id: string, data: ToggleReminderDto): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.apiUrl}/api/medicine/${id}/reminder`, data);
  }
}
