import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export type objectType = Record<string, number | boolean | string | null>;

/**
 * Function for use in the dtos for matching two properties like password, confirm_password
 * @param property
 * @param validationOptions
 * @constructor
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: objectType, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: string | number | boolean | null, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as objectType)[relatedPropertyName];
    return value === relatedValue;
  }
}
