import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { User, UserRole } from '../../models/user.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { Roles } from '../../core/constants/roles.const';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  protected submitted = false;
  protected roles: UserRole[] = Roles;
  protected form!: FormGroup;
  protected formType: string = '';
  protected userData!: User;

  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
    //
    this.form = this.fb.group({
      _id: ['', Validators.required],
      name: ['', Validators.required],
      email: [
        '',
        [Validators.required, Validators.email, this.duplicateEmailValidator()],
      ],
      role: [null as UserRole | null, Validators.required],
    });

    this.formType = this.config.data?.type || 'add';
    this.userData = this.config.data?.user || {};

    if (this.formType === 'edit' && this.userData !== undefined) {
      this.patchForm(this.userData);
      this.form.get('email')?.updateValueAndValidity();
    } else {
      const newId = this.generateUserId();

      this.form.patchValue({
        _id: newId,
      });
    }
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      _id: user._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
    });
  }

  protected submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.value);
  }

  protected cancel(): void {
    this.ref.close(false);
  }

  private generateUserId(): number {
    const userData = localStorage.getItem('users');

    const users: User[] = userData ? JSON.parse(userData) : [];

    if (!users.length) return 1;

    const maxId = Math.max(...users.map((u) => u._id));

    return maxId + 1;
  }

  private duplicateEmailValidator() {
    return (control: any) => {
      if (!control.value) return null;

      const email = control.value.toLowerCase();

      const userData = localStorage.getItem('users');
      const users: User[] = userData ? JSON.parse(userData) : [];

      const isDuplicate = users.some((user) => {
        if (this.formType === 'edit') {
          return (
            user.email.toLowerCase() === email && user._id !== this.userData._id
          );
        }
        return user.email.toLowerCase() === email;
      });

      return isDuplicate ? { duplicateEmail: true } : null;
    };
  }
}
