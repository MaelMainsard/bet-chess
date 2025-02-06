import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { MatchResult } from '../../match/match';

@ValidatorConstraint({ name: 'isMatchResult', async: false })
@Injectable()
export class IsResultValidConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return Object.values(MatchResult).includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid match result (WHITE, BLACK, or DRAW)`;
  }
}

export function IsResultValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isResultValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsResultValidConstraint,
    });
  };
}