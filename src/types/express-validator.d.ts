declare module "express-validator" {
  import { Request, Response, NextFunction } from "express";

  interface ValidationChain {
    (req: Request, res: Response, next: NextFunction): void;
    withMessage(message: string): ValidationChain;
    isEmail(): ValidationChain;
    normalizeEmail(): ValidationChain;
    isLength(options: { min?: number; max?: number }): ValidationChain;
    matches(pattern: RegExp): ValidationChain;
    isFloat(options?: { min?: number; max?: number }): ValidationChain;
    isInt(options?: { min?: number; max?: number }): ValidationChain;
    isISO8601(): ValidationChain;
    isString(): ValidationChain;
    isObject(): ValidationChain;
    isArray(options?: { min?: number; max?: number }): ValidationChain;
    optional(): ValidationChain;
    isIn(values: readonly string[]): ValidationChain;
    notEmpty(): ValidationChain;
    run(req: Request): Promise<void>;
  }

  export function body(field: string): ValidationChain;
  export function param(field: string): ValidationChain;
  export function query(field: string): ValidationChain;
  export function validationResult(req: Request): {
    isEmpty(): boolean;
    array(): any[];
  };
}
