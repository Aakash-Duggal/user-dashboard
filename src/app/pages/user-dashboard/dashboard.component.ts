import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user.model';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { roleOptions } from '../../core/constants/roles.const';
import { DropdownModule } from 'primeng/dropdown';
import { SearchComponent } from "../../shared/components/search/search.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    SkeletonModule,
    InputGroupModule,
    InputTextModule,
    DropdownModule,
    SearchComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: any;
  @ViewChild('roleChart', { static: true })
  roleChartRef!: ElementRef<HTMLCanvasElement>;
  private destroy$ = new Subject<void>();
  protected users: User[] = [];
  protected UserFormComponent: any;
  private ref!: DynamicDialogRef;
  private chart: any;
  private ChartJS: any;
  protected tableLoading = false;
  protected roleOptions = roleOptions;

  constructor(
    private userService: UserService,
    private dialogService: DialogService
  ) {
    //
  }

  ngOnInit(): void {
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe((users) => {
        this.users = users;
        this.tableLoading = false;
        this.updateChart(users);
      });
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }

  protected async onAddUser(): Promise<void> {
    const { UserFormComponent } = await import(
      '../../modals/user-form/user-form.component'
    );

    this.ref = this.dialogService.open(UserFormComponent, {
      header: 'Add User',
      width: '400px',
      modal: true,
      closable: false,
    });

    this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe((user: User) => {
      if (user) {
        // this.userService.addUser(user);
        this.addUserWithApiSimulation(user);
      }
    });
  }

  private addUserWithApiSimulation(user: User): void {
    this.tableLoading = true;

    setTimeout(() => {
      this.userService.addUser(user);
    }, 800);
  }

  protected async loadChartJs() {
    if (!this.ChartJS) {
      this.ChartJS = await import('chart.js/auto');
    }
    return this.ChartJS;
  }

  protected async updateChart(users: User[]) {
    const roleCount = {
      Admin: 0,
      Editor: 0,
      Viewer: 0,
    };

    users.forEach((user) => {
      roleCount[user.role]++;
    });

    const ChartJS = await this.loadChartJs();

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new ChartJS.Chart(this.roleChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [
          {
            data: [roleCount.Admin, roleCount.Editor, roleCount.Viewer],
            backgroundColor: ['#1c4980', '#383838', '#9aa7bd'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  onRoleFilter(role: string | null): void {
    if (role) {
      this.table.filter(role, 'role', 'equals');
    } else {
      this.table.clear();
    }
  }

  onSearchChange(value: string): void {
  this.table.filterGlobal(value, 'contains');
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.ref) {
      this.ref.close();
    }

    if (this.chart) {
      this.chart.destroy();
    }
  }
}
