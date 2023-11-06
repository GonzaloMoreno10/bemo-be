import {
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { reservedFieldNames } from 'src/common/constant/common.constant';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';
import { NewObjectDTO, ObjectAttrDef } from '../dtos/object.dto';
import { parseBoolean } from 'src/common/services/date.service';
import { ResponseService } from 'src/common/services/response.service';
import { DbObjectService } from '../services/db-object.service';
import { ObjectService } from '../services/object.service';
import { ValidService } from '../services/valid.service';

@Injectable()
export class NewObjectPipe implements PipeTransform {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @Inject(ResponseService) private responseService: ResponseService,
    @Inject(ObjectService) private objectService: ObjectService,
    @Inject(DbObjectService) private dbObjectService: DbObjectService,
    @Inject(ValidService) private validService: ValidService,
  ) {}
  async transform(value: NewObjectDTO) {
    if (value.name.toLowerCase().trim().includes(' ')) {
      throw new BadRequestException(`Invalid object name ${value.name}`);
    }

    const existObj = await this.objectService.existObject(value.name);

    if (existObj) {
      throw new BadRequestException(`${value.name} model already exists`);
    }

    if (value.relations) {
      await this.validService.validRelations(value.relations);
    }

    this.validService.validConfigs(value.configs);

    this.validService.validAttributes(value.properties);

    if (value.compositeUnique) {
      this.validService.validCompositeUnique(
        value.compositeUnique,
        value.properties.map((x: ObjectAttrDef) => x.name),
      );
    }

    //*Remove reserved keywords field
    const filteredProps = value.properties.filter(
      (x: ObjectAttrDef) => !reservedFieldNames.includes(x.name),
    );

    //*DEFAULT SETTING

    if ([null, undefined].includes(value.configs.auditFields)) {
      value.configs.auditFields = parseBoolean(
        this.configService.tableConfig.default_audit_fields,
      );
    }
    if ([null, undefined].includes(value.configs.delStrategy)) {
      value.configs.delStrategy = 'LOGICAL';
    }
    if ([null, undefined].includes(value.configs.userAudit)) {
      value.configs.userAudit = parseBoolean(
        this.configService.tableConfig.default_user_audit,
      );
    }
    if ([null, undefined].includes(value.configs.hasTrigger)) {
      value.configs.hasTrigger = parseBoolean(
        this.configService.tableConfig.default_hast_trigger,
      );
    }
    if ([null, undefined].includes(value.configs.deleteable)) {
      value.configs.deleteable = parseBoolean(
        this.configService.tableConfig.default_deletable,
      );
    }
    if ([null, undefined].includes(value.configs.queryable)) {
      value.configs.queryable = parseBoolean(
        this.configService.tableConfig.default_queryable,
      );
    }
    value.properties = filteredProps;
    return value;
  }
}
