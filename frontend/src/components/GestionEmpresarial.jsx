import Clientes from "./gestion-empresarial/Clientes.jsx";
import Productos from "./gestion-empresarial/Productos.jsx";
import Facturas from "./gestion-empresarial/Facturas.jsx";
import Proveedores from "./gestion-empresarial/Proveedores.jsx";
import Empleados from "./gestion-empresarial/Empleados.jsx";
import Servicios from "./gestion-empresarial/Servicios.jsx";
import Pagos from "./gestion-empresarial/Pagos.jsx";

const componentesPorModulo = {
  clientes: Clientes,
  productos: Productos,
  facturas: Facturas,
  proveedores: Proveedores,
  empleados: Empleados,
  servicios: Servicios,
  pagos: Pagos,
};

export default function GestionEmpresarial({ modulo }) {
  const ComponenteModulo = componentesPorModulo[modulo];

  if (!ComponenteModulo) return null;

  return <ComponenteModulo />;
}
