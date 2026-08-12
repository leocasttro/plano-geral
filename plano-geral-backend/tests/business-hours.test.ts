import assert from 'assert';
import { BusinessHoursService } from '../src/application/services/BusinessHoursService';

function data(value: string): Date {
  return new Date(value);
}

function run() {
  assert.strictEqual(
    BusinessHoursService.calcularHoras(
      data('2026-08-10T08:00:00'),
      data('2026-08-10T18:00:00'),
    ),
    10,
    'dia comercial completo deve contar 10h',
  );

  assert.strictEqual(
    BusinessHoursService.calcularHoras(
      data('2026-08-10T06:00:00'),
      data('2026-08-10T20:00:00'),
    ),
    10,
    'horários fora do expediente devem ser limitados a 08h-18h',
  );

  assert.strictEqual(
    BusinessHoursService.calcularHoras(
      data('2026-08-14T17:00:00'),
      data('2026-08-17T09:00:00'),
    ),
    2,
    'fim de semana deve ser ignorado',
  );

  assert.strictEqual(
    BusinessHoursService.calcularHoras(
      data('2026-08-15T09:00:00'),
      data('2026-08-16T17:00:00'),
    ),
    0,
    'sábado e domingo não devem contar tempo',
  );

  assert.strictEqual(
    BusinessHoursService.calcularHoras(
      data('2026-08-10T12:30:00'),
      data('2026-08-10T15:00:00'),
    ),
    2.5,
    'intervalo dentro do expediente deve contar normalmente',
  );
}

run();
console.log('Business hours tests passed.');
