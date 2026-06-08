import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  prev(): void { this.pageChange.emit(this.currentPage() - 1); }
  next(): void { this.pageChange.emit(this.currentPage() + 1); }
}
