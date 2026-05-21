import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, MetodoPago, Perfil, RolUsuario, Usuario } from '../models/api.models';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  ciudad: string;
  password: string;
  planId: number;
  referidoPorId?: number | null;
  metodoPagoPrimerPago: MetodoPago;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'qf_token';
  private readonly userKey = 'qf_user';
  private readonly profileKey = 'qf_active_profile';
  private readonly api = environment.apiUrl;

  private userSignal = signal<Usuario | null>(this.loadUser());
  private profileSignal = signal<Perfil | null>(this.loadProfile());
  currentUser = this.userSignal.asReadonly();
  activeProfile = this.profileSignal.asReadonly();
  isAuthenticated = computed(() => !!this.token && !!this.userSignal());
  role = computed<RolUsuario | null>(() => this.userSignal()?.rol ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, payload).pipe(tap(res => this.persist(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, payload).pipe(tap(res => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.profileKey);
    this.userSignal.set(null);
    this.profileSignal.set(null);
    this.router.navigateByUrl('/login');
  }

  hasRole(roles: RolUsuario[]): boolean {
    const role = this.userSignal()?.rol;
    return !!role && roles.includes(role);
  }

  refreshUser(user: Usuario): void {
    this.userSignal.set(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getPerfilActivo(): Perfil | null {
    return this.profileSignal();
  }

  setPerfilActivo(perfil: Perfil | null): void {
    this.profileSignal.set(perfil);
    if (perfil) {
      localStorage.setItem(this.profileKey, JSON.stringify(perfil));
    } else {
      localStorage.removeItem(this.profileKey);
    }
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.usuario));
    this.userSignal.set(res.usuario);
    this.setPerfilActivo(null);
  }

  private loadUser(): Usuario | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try { return JSON.parse(raw) as Usuario; } catch { return null; }
  }

  private loadProfile(): Perfil | null {
    const raw = localStorage.getItem(this.profileKey);
    if (!raw) return null;
    try { return JSON.parse(raw) as Perfil; } catch { return null; }
  }
}
