import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-client-cert';

@Injectable()
export class CertStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  // Aquí implementamos la lógica de autenticación
  // Se ejecutará cuando el usuario presente un certificado válido
  async validate(clientCert: any): Promise<any> {
    // La lógica aquí puede variar según tus necesidades.
    // Por ejemplo, puedes buscar y validar el certificado en una base de datos.
    // Si el certificado no es válido, lanza una excepción UnauthorizedException.
    // Si es válido, puedes retornar un objeto de usuario que represente al cliente.
    throw new UnauthorizedException('No autorizado');
  }
}
