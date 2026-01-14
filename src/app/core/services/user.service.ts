import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Internal state
  private usersSubject = new BehaviorSubject<User[]>([]);

  // Public observable
  users$ = this.usersSubject.asObservable();

  constructor() {}

  getUsers(): User[] {
    return this.usersSubject.value;
  }

  addUser(user: User): void {
    const updatedUsers = [...this.usersSubject.value, user];
    this.usersSubject.next(updatedUsers);
  }
}
